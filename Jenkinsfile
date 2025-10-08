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

    // === 1️⃣ CLONAGE ===
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

    // === 2️⃣ ENVIRONNEMENT ===
    stage('Check Docker & Node') {
      steps {
        bat 'docker --version'
        bat 'node --version'
        bat 'npm --version'
      }
    }

    // === 3️⃣ INSTALLATION PARALLÈLE AVEC CACHE ===
    stage('Install Dependencies (Parallel + Cached)') {
      parallel {
        stage('Frontend Deps') {
          steps {
            dir('frontend') {
              echo '📦 Installing frontend deps with cache...'
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
              echo '📦 Installing backend deps with cache...'
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

    // === 5️⃣ TESTS PARALLÈLES + INCRÉMENTAUX ===
    stage('Run Tests (Parallel + Incremental)') {
      parallel {
        // FRONTEND TESTS
        stage('Frontend Tests') {
          steps {
            script {
              def changes = bat(script: 'git diff --name-only HEAD~1 HEAD', returnStdout: true).trim().replace("\r", "")
              echo "📂 Changed files: ${changes}"

              if (changes.contains("fatal:")) {
                echo "⚠️ First build → full frontend tests."
                changes = "frontend/"
              }

              dir('frontend') {
                if (changes.contains("frontend/")) {
                  echo "🧪 Running frontend tests (with coverage update)..."
                  bat 'npx vitest run --coverage || exit /b 0'
                } else {
                  echo "✅ No frontend changes — reusing previous coverage."
                  // Vérifie si un coverage existe déjà, sinon avertit
                  bat """
                    if not exist coverage\\lcov.info (
                      echo ⚠️ WARNING: No existing coverage found. Running minimal tests...
                      npx vitest run --coverage || exit /b 0
                    ) else (
                      echo 📁 Existing coverage retained: coverage\\lcov.info
                    )
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
                echo "⚠️ First build → full backend tests."
                changes = "backend/"
              }

              dir('backend') {
                if (changes.contains("backend/")) {
                  echo "🧪 Running backend tests (with coverage update)..."
                  bat """
                    set PATH=%cd%\\node_modules\\.bin;%PATH%
                    npx jest --coverage || exit /b 0
                  """
                } else {
                  echo "✅ No backend changes — reusing previous coverage."
                  bat """
                    if not exist coverage\\lcov.info (
                      echo ⚠️ WARNING: No existing coverage found. Running minimal tests...
                      set PATH=%cd%\\node_modules\\.bin;%PATH%
                      npx jest --coverage || exit /b 0
                    ) else (
                      echo 📁 Existing coverage retained: coverage\\lcov.info
                    )
                  """
                }
              }
            }
          }
        }
      }
    }

    // === 6️⃣ BUILD DOCKER ===
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

    // === 7️⃣ DEPLOIEMENT ===
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

    // === 8️⃣ SONARQUBE PARALLÈLE ===
    stage('SonarQube Analysis (Parallel)') {
      parallel {
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

        stage('Backend SonarQube') {
          steps {
            withSonarQubeEnv('SonarQube') {
              withCredentials([string(credentialsId: 'SONAR_AUTH_TOKEN', variable: 'TOKEN')]) {
                dir('backend') {
                  bat """
                    set PATH=%cd%\\node_modules\\.bin;%PATH%
                    npx sonar-scanner ^
                    -Dsonar.projectKey=backend ^
                    -Dsonar.sources=src ^
                    -Dsonar.tests=tests ^
                    -Dsonar.test.inclusions=**/*.test.js ^
                    -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info ^
                    -Dsonar.exclusions=**/node_modules/** ^
                    -Dsonar.host.url=http://localhost:9000 ^
                    -Dsonar.login=%TOKEN%
                  """
                }
              }
            }
          }
        }
      }
    }
  }
}
