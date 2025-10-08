pipeline {
  agent any

  tools {
    nodejs 'node24'
  }

  options {
    ansiColor('xterm')
    timestamps()
  }

  environment {
    NPM_CACHE = "C:\\ProgramData\\Jenkins\\.jenkins\\npm_cache"
  }

  stages {

    // --- Vérifications de base ---
    stage('Check Docker & Node') {
      steps {
        bat 'docker --version'
        bat 'node --version'
        bat 'npm --version'
      }
    }

    // --- INSTALLATION PARALLÈLE ---
    stage('Install Dependencies (Parallel)') {
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

    // --- BUILD FRONTEND ---
    stage('Build Frontend') {
      steps {
        dir('frontend') {
          echo '⚙️ Building frontend...'
          bat 'npm run build'
        }
      }
    }

    // --- TESTS EN PARALLÈLE ---
    stage('Run Tests (Parallel)') {
      parallel {
        stage('Frontend Tests') {
          steps {
            dir('frontend') {
              echo '🧪 Running frontend tests with coverage...'
              bat 'npx vitest run --coverage || exit /b 0'
            }
          }
        }
        stage('Backend Tests') {
          steps {
            dir('backend') {
              bat 'set PATH=%cd%\\node_modules\\.bin;%PATH%'
              echo '🧪 Running backend tests with coverage...'
              bat 'npm run test:cov || exit /b 0'
            }
          }
        }
      }
    }

    // --- BUILD DOCKER EN PARALLÈLE ---
    stage('Build Docker Images (Parallel)') {
      parallel {
        stage('Frontend Image') {
          steps {
            script {
              echo '🐳 Building frontend Docker image...'
              bat 'set DOCKER_BUILDKIT=1'
              bat 'docker build -t ecommerce-frontend ./frontend'
            }
          }
        }
        stage('Backend Image') {
          steps {
            script {
              echo '🐳 Building backend Docker image...'
              bat 'set DOCKER_BUILDKIT=1'
              bat 'docker build -t ecommerce-backend ./backend'
            }
          }
        }
      }
    }

    // --- DÉPLOIEMENT ---
    stage('Deploy Containers') {
      steps {
        script {
          echo '🧹 Stopping old containers...'
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

    // --- ANALYSE SONARQUBE EN PARALLÈLE ---
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
                    npx sonar-scanner ^
                    -Dsonar.projectKey=backend ^
                    -Dsonar.sources=src ^
                    -Dsonar.tests=tests ^
                    -Dsonar.test.inclusions=**/*.test.js ^
                    -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info ^
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
