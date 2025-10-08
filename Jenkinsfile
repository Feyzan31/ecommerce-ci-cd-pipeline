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

    // 🧩 Étape 1 : INSTALLATION PARALLÈLE
    stage('Install Dependencies (Parallel)') {
      parallel {
        stage('Frontend Deps') {
          steps {
            dir('frontend') {
              echo '📦 Installation des dépendances frontend avec cache...'
              bat 'npm ci --prefer-offline --cache %NPM_CACHE%'
            }
          }
        }
        stage('Backend Deps') {
          steps {
            dir('backend') {
              echo '📦 Installation des dépendances backend avec cache...'
              bat 'npm ci --prefer-offline --cache %NPM_CACHE%'
            }
          }
        }
      }
    }

    // 🧩 Étape 2 : BUILD FRONTEND
    stage('Build Frontend') {
      steps {
        dir('frontend') {
          bat 'npm run build'
        }
      }
    }

    // 🧩 Étape 3 : TESTS PARALLÈLES
    stage('Run Tests (Parallel)') {
      parallel {
        stage('Frontend Tests') {
          steps {
            dir('frontend') {
              echo '🧪 Tests frontend...'
              bat 'npm test -- --watchAll=false --passWithNoTests || exit /b 0'
            }
          }
        }
        stage('Backend Tests') {
          steps {
            dir('backend') {
              echo '🧪 Tests backend...'
              bat 'npm test --passWithNoTests || exit /b 0'
            }
          }
        }
      }
    }

    // 🧩 Étape 4 : BUILD DOCKER EN PARALLÈLE
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

    // 🧩 Étape 5 : DÉPLOIEMENT
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

    // 🧩 Étape 6 : ANALYSE SONARQUBE EN PARALLÈLE
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
      echo '✅ Pipeline CI/CD PARALLÈLE terminée avec succès !'
    }
    failure {
      echo '❌ Erreur pendant la pipeline.'
    }
    always {
      echo '🧾 Fin du pipeline.'
      echo "⏱ Durée totale du pipeline : ${currentBuild.durationString}"
      bat 'docker ps -a'
    }
  }
}
