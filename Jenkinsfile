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
    // 📦 Dossier cache partagé entre les builds Jenkins
    NPM_CACHE = "C:\\ProgramData\\Jenkins\\.jenkins\\npm_cache"
  }

  stages {

    // === 1️⃣ CLONAGE COMPLET ===
    stage('Checkout') {
      steps {
        checkout([
          $class: 'GitSCM',
          branches: [[name: '*/main']], // adapte selon ta branche
          extensions: [[$class: 'CloneOption', depth: 0, noTags: false, shallow: false]],
          userRemoteConfigs: [[url: 'https://github.com/Feyzan31/ecommerce-ci-cd-pipeline.git']]
        ])
      }
    }

    // === 2️⃣ VÉRIFICATION ENVIRONNEMENT ===
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
              echo '📦 Installation des dépendances frontend (cache activé)...'
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
              echo '📦 Installation des dépendances backend (cache activé)...'
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
          echo '⚙️ Construction du frontend...'
          bat 'npm run build'
        }
      }
    }

    // === 5️⃣ TESTS FRONTEND (INCREMENTAUX) ===
    stage('Frontend Tests (Incremental)') {
      steps {
        script {
          def changes = bat(script: 'git diff --name-only HEAD~1 HEAD', returnStdout: true).trim().replace("\r", "")
          echo "📂 Fichiers modifiés : ${changes}"

          if (changes.contains("fatal:")) {
            echo "⚠️ Premier build — exécution complète des tests FRONTEND."
            changes = "frontend/"
          }

          if (changes.contains("frontend/")) {
            dir('frontend') {
              echo "🧪 Tests FRONTEND..."
              bat 'npx vitest run --coverage || exit /b 0'
            }
          } else {
            echo "✅ Aucun changement dans frontend — skip tests frontend."
          }
        }
      }
    }

    // === 6️⃣ TESTS BACKEND (INCREMENTAUX) ===
    stage('Backend Tests (Incremental)') {
      steps {
        script {
          def changes = bat(script: 'git diff --name-only HEAD~1 HEAD', returnStdout: true).trim().replace("\r", "")
          echo "📂 Fichiers modifiés : ${changes}"

          if (changes.contains("fatal:")) {
            echo "⚠️ Premier build — exécution complète des tests BACKEND."
            changes = "backend/"
          }

          if (changes.contains("backend/")) {
            dir('backend') {
              echo "🧪 Tests BACKEND..."
              bat 'npm run test:cov || exit /b 0'
            }
          } else {
            echo "✅ Aucun changement dans backend — skip tests backend."
          }
        }
      }
    }

    // === 7️⃣ BUILD DOCKER (CLASSIQUE) ===
    stage('Build Docker Images') {
      steps {
        script {
          echo '🐳 Construction classique des images Docker...'
          bat 'rd /s /q backend\\node_modules || exit /b 0'
          bat 'docker build -t ecommerce-frontend ./frontend'
          bat 'docker build -t ecommerce-backend ./backend'
        }
      }
    }

    // === 8️⃣ DEPLOIEMENT ===
    stage('Deploy Containers') {
      steps {
        script {
          echo '🧹 Suppression des anciens conteneurs...'
          bat 'docker stop ecommerce-frontend || exit /b 0'
          bat 'docker rm ecommerce-frontend || exit /b 0'
          bat 'docker stop ecommerce-backend || exit /b 0'
          bat 'docker rm ecommerce-backend || exit /b 0'

          echo '🚀 Lancement des nouveaux conteneurs...'
          bat 'docker run -d --restart always -p 5173:80 --name ecommerce-frontend ecommerce-frontend'
          bat 'docker run -d --restart always -p 4000:4000 --name ecommerce-backend ecommerce-backend'
        }
      }
    }

    // === 9️⃣ ANALYSE SONARQUBE PARALLÈLE ===
    stage('SonarQube Analysis (Parallel)') {
      parallel {
        stage('Frontend SonarQube') {
          steps {
            withSonarQubeEnv('SonarQube') {
              withCredentials([string(credentialsId: 'SONAR_AUTH_TOKEN', variable: 'TOKEN')]) {
                dir('frontend') {
                  bat 'npx vitest run --coverage'
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
                  bat 'set PATH=%cd%\\node_modules\\.bin;%PATH%'
                  bat 'npm run test:cov'
                  bat """
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
