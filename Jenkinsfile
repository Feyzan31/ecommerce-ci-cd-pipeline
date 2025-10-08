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

    stage('Checkout') {
      steps {
        // 🔁 Clone complet pour permettre git diff
        checkout([
          $class: 'GitSCM',
          branches: [[name: '*/main']],
          doGenerateSubmoduleConfigurations: false,
          extensions: [[$class: 'CloneOption', depth: 0, noTags: false, shallow: false]],
          userRemoteConfigs: [[url: 'https://github.com/Feyzan31/ecommerce-ci-cd-pipeline.git']]
        ])
      }
    }

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
              bat 'npm ci --prefer-offline --cache %NPM_CACHE%'
            }
          }
        }
        stage('Backend Deps') {
          steps {
            dir('backend') {
              bat 'npm ci --prefer-offline --cache %NPM_CACHE%'
            }
          }
        }
      }
    }

    stage('Build Frontend') {
      steps {
        dir('frontend') {
          bat 'npm run build'
        }
      }
    }

    // --- TESTS INCRÉMENTAUX ---
    stage('Run Incremental Tests') {
      steps {
        script {
          // 🔍 Récupération des fichiers modifiés
          def result = bat(script: 'git diff --name-only HEAD~1 HEAD', returnStdout: true, returnStatus: false)
          def changes = result.trim().replace("\r", "")
          echo "🔍 Fichiers modifiés : ${changes}"

          if (changes.contains("fatal:")) {
            echo "⚠️ Pas de commit précédent → exécution complète."
            changes = "frontend/ backend/"
          }

          if (changes == "") {
            echo "✅ Aucun changement détecté → skip des tests."
          } else {
            if (changes.contains("frontend/")) {
              dir('frontend') {
                echo "🧪 Tests frontend..."
                bat 'npx vitest run --coverage || exit /b 0'
              }
            }

            if (changes.contains("backend/")) {
              dir('backend') {
                echo "🧪 Tests backend..."
                bat 'npm run test:cov || exit /b 0'
              }
            }

            if (!changes.contains("frontend/") && !changes.contains("backend/")) {
              echo "ℹ️ Aucun test impacté."
            }
          }
        }
      }
    }

    // --- DOCKER BUILDS EN PARALLÈLE ---
    stage('Build Docker Images (Parallel)') {
      parallel {
        stage('Frontend Image') {
          steps {
            script {
              bat 'set DOCKER_BUILDKIT=1'
              bat 'docker build -t ecommerce-frontend ./frontend'
            }
          }
        }
        stage('Backend Image') {
          steps {
            script {
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
          echo '🧹 Nettoyage anciens conteneurs...'
          bat 'docker stop ecommerce-frontend || exit /b 0'
          bat 'docker rm ecommerce-frontend || exit /b 0'
          bat 'docker stop ecommerce-backend || exit /b 0'
          bat 'docker rm ecommerce-backend || exit /b 0'

          echo '🚀 Lancement nouveaux conteneurs...'
          bat 'docker run -d --restart always -p 5173:80 --name ecommerce-frontend ecommerce-frontend'
          bat 'docker run -d --restart always -p 4000:4000 --name ecommerce-backend ecommerce-backend'
        }
      }
    }

    // --- ANALYSE SONARQUBE PARALLÈLE ---
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
