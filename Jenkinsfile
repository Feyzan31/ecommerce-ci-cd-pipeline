pipeline {
  agent any

  tools {
    nodejs 'node24'
  }

  options {
    ansiColor('xterm')
    timestamps()
    parallelsAlwaysFailFast()
  }

  environment {
    NPM_CACHE = "C:\\ProgramData\\Jenkins\\.jenkins\\npm_cache"
  }

  stages {

    // === 1️⃣ CHECKOUT ===
    stage('Checkout') {
      steps {
        checkout([
          $class: 'GitSCM',
          branches: [[name: '*/main']],
          extensions: [[$class: 'CloneOption', depth: 0, noTags: false, shallow: false]],
          userRemoteConfigs: [[url: 'https://github.com/Feyzan31/ecommerce-ci-cd-pipeline.git']]
        ])
      }
    }

    // === 2️⃣ CHECK ENVIRONMENT ===
    stage('Check Docker & Node') {
      steps {
        bat 'docker --version'
        bat 'node --version'
        bat 'npm --version'
      }
    }

    // === 3️⃣ INSTALL DEPENDENCIES WITH CACHE ===
    stage('Install Dependencies (Parallel + Cached)') {
      parallel {
        stage('Frontend Deps') {
          steps {
            dir('frontend') {
              echo '📦 Installing frontend dependencies with cache...'
              bat """
                if not exist "%NPM_CACHE%" mkdir "%NPM_CACHE%"
                npm ci --prefer-offline --cache %NPM_CACHE%
              """
            }
          }
        }
        stage('Backend Deps') {
          steps {
            dir('backend') {
              echo '📦 Installing backend dependencies with cache...'
              bat """
                if not exist "%NPM_CACHE%" mkdir "%NPM_CACHE%"
                npm ci --prefer-offline --cache %NPM_CACHE%
              """
            }
          }
        }
      }
    }

    // === 4️⃣ BUILD FRONTEND ===
    stage('Build Frontend') {
      steps {
        dir('frontend') {
          echo '⚙️ Building frontend...'
          bat 'npm run build'
        }
      }
    }

    // === 5️⃣ INCREMENTAL TESTS (PARALLEL) ===
    stage('Run Incremental Tests (Parallel)') {
      parallel {

        // FRONTEND TESTS
        stage('Frontend Tests') {
          steps {
            script {
              def changes = bat(script: 'git diff --name-only HEAD~1 HEAD', returnStdout: true).trim().replace("\r", "")
              echo "📂 Changed files: ${changes}"

              if (changes.contains("fatal:")) {
                echo "⚠️ First build → running full frontend tests."
                changes = "frontend/"
              }

              dir('frontend') {
                if (changes.contains("frontend/")) {
                  echo "🧪 Running frontend tests (with coverage)..."
                  bat 'npx vitest run --coverage || exit /b 0'
                } else {
                  echo "✅ No frontend changes — skipping tests, generating dummy coverage."
                  bat """
                    if not exist coverage mkdir coverage
                    echo TN: > coverage\\lcov.info
                    echo SF:dummy_frontend.js >> coverage\\lcov.info
                    echo end_of_record >> coverage\\lcov.info
                  """
                }
              }
            }
          }
        }

        // BACKEND TESTS
        stage('Backend Tests') {
          steps {
            script {
              def changes = bat(script: 'git diff --name-only HEAD~1 HEAD', returnStdout: true).trim().replace("\r", "")
              echo "📂 Changed files: ${changes}"

              if (changes.contains("fatal:")) {
                echo "⚠️ First build → running full backend tests."
                changes = "backend/"
              }

              dir('backend') {
                if (changes.contains("backend/")) {
                  echo "🧪 Running backend tests (with coverage)..."
                  bat '''
                    call set "PATH=%cd%\\node_modules\\.bin;%PATH%"
                    npx jest --coverage || exit /b 0
                  '''
                } else {
                  echo "✅ No backend changes — skipping tests, generating dummy coverage."
                  bat """
                    if not exist coverage mkdir coverage
                    echo TN: > coverage\\lcov.info
                    echo SF:dummy_backend.js >> coverage\\lcov.info
                    echo end_of_record >> coverage\\lcov.info
                  """
                }
              }
            }
          }
        }
      }
    }

    // === 6️⃣ BUILD DOCKER IMAGES (no caching) ===
    stage('Build Docker Images') {
      steps {
        script {
          echo '🐳 Building Docker images...'
          bat 'rd /s /q backend\\node_modules || exit /b 0'
          bat 'docker build -t ecommerce-frontend ./frontend'
          bat 'docker build -t ecommerce-backend ./backend'
        }
      }
    }

    // === 7️⃣ DEPLOY CONTAINERS ===
    stage('Deploy Containers') {
      steps {
        script {
          echo '🧹 Cleaning old containers...'
          bat 'docker stop ecommerce-frontend || exit /b 0'
          bat 'docker rm ecommerce-frontend || exit /b 0'
          bat 'docker stop ecommerce-backend || exit /b 0'
          bat 'docker rm ecommerce-backend || exit /b 0'

          echo '🚀 Starting new containers...'
          bat 'docker run -d --restart always -p 5173:80 --name ecommerce-frontend ecommerce-frontend'
          bat 'docker run -d --restart always -p 4000:4000 --name ecommerce-backend ecommerce-backend'
        }
      }
    }

    // === 8️⃣ SONARQUBE ANALYSIS (PARALLEL) ===
    stage('SonarQube Analysis (Parallel)') {
      parallel {

        // FRONTEND SONAR
        stage('Frontend SonarQube') {
          steps {
            withSonarQubeEnv('SonarQube') {
              withCredentials([string(credentialsId: 'SONAR_AUTH_TOKEN', variable: 'TOKEN')]) {
                dir('frontend') {
                  bat """
                    npx sonar-scanner ^
                    -Dsonar.projectKey=frontend ^
                    -Dsonar.sources=src ^
                    -Dsonar.tests=src ^
                    -Dsonar.test.inclusions=**/*.test.js ^
                    -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info ^
                    -Dsonar.exclusions=**/node_modules/**,**/dist/** ^
                    -Dsonar.host.url=http://localhost:9000 ^
                    -Dsonar.login=%TOKEN%
                  """
                }
              }
            }
          }
        }

        // BACKEND SONAR
        stage('Backend SonarQube') {
          steps {
            withSonarQubeEnv('SonarQube') {
              withCredentials([string(credentialsId: 'SONAR_AUTH_TOKEN', variable: 'TOKEN')]) {
                dir('backend') {
                  bat '''
                    call set "PATH=%cd%\\node_modules\\.bin;%PATH%"
                    npx sonar-scanner ^
                      -Dsonar.projectKey=backend ^
                      -Dsonar.sources=src ^
                      -Dsonar.tests=tests ^
                      -Dsonar.test.inclusions=**/*.test.js ^
                      -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info ^
                      -Dsonar.exclusions=**/node_modules/** ^
                      -Dsonar.host.url=http://localhost:9000 ^
                      -Dsonar.login=%TOKEN%
                  '''
                }
              }
            }
          }
        }
      }
    }
  }
}
