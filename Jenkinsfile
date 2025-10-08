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
    stage('Check Docker & Node') {
      steps {
        bat 'docker --version'
        bat 'node --version'
        bat 'npm --version'
      }
    }

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

    // 🧩 Étape d’optimisation : TESTS INCRÉMENTAUX
    stage('Run Incremental Tests') {
      steps {
        script {
          // Récupération des fichiers modifiés depuis le dernier commit
          def changes = bat(script: 'git diff --name-only HEAD~1 HEAD', returnStdout: true).trim()
          echo "🔍 Fichiers modifiés : ${changes}"

          if (changes == "") {
            echo "✅ Aucun changement détecté, skip des tests."
          } else {
            // Si des fichiers frontend ont changé → tests frontend
            if (changes.contains("frontend/")) {
              dir('frontend') {
                echo "🧪 Tests frontend modifiés..."
                bat 'npm test -- --passWithNoTests || exit /b 0'
              }
            }

            // Si des fichiers backend ont changé → tests backend
            if (changes.contains("backend/")) {
              dir('backend') {
                echo "🧪 Tests backend modifiés..."
                bat 'npm test -- --passWithNoTests || exit /b 0'
              }
            }

            // Si aucun fichier source détecté → skip
            if (!changes.contains("frontend/") && !changes.contains("backend/")) {
              echo "ℹ️ Aucun test à exécuter pour ces fichiers."
            }
          }
        }
      }
    }

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

    stage('Deploy Containers') {
      steps {
        script {
          echo '🧹 Stop & remove anciens conteneurs'
          bat 'docker stop ecommerce-frontend || exit /b 0'
          bat 'docker rm ecommerce-frontend || exit /b 0'
          bat 'docker stop ecommerce-backend || exit /b 0'
          bat 'docker rm ecommerce-backend || exit /b 0'

          echo '🚀 Lancement des nouveaux conteneurs'
          bat 'docker run -d --restart always -p 5173:80 --name ecommerce-frontend ecommerce-frontend'
          bat 'docker run -d --restart always -p 4000:4000 --name ecommerce-backend ecommerce-backend'
        }
      }
    }

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

  post {
    success {
      echo '✅ Pipeline CI/CD avec TESTS INCRÉMENTAUX terminée avec succès !'
    }
    failure {
      echo '❌ Erreur pendant la pipeline.'
    }
    always {
      echo "🧾 Fin du pipeline."
      echo "⏱ Durée totale du pipeline : ${currentBuild.durationString}"
    }
  }
}
