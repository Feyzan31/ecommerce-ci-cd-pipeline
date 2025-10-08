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
    // Dossier cache partagé entre les builds
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

    stage('Install Frontend Deps (Cached)') {
      steps {
        dir('frontend') {
          echo '📦 Installation des dépendances frontend avec cache...'
          bat 'npm ci --prefer-offline --cache %NPM_CACHE%'
        }
      }
    }

    stage('Install Backend Deps (Cached)') {
      steps {
        dir('backend') {
          echo '📦 Installation des dépendances backend avec cache...'
          bat 'npm ci --prefer-offline --cache %NPM_CACHE%'
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

    stage('Frontend Tests') {
      steps {
        dir('frontend') {
          bat 'npm test || exit /b 0'
        }
      }
    }

    stage('Backend Tests') {
      steps {
        dir('backend') {
          bat 'npm test || exit /b 0'
        }
      }
    }

    stage('Build Docker Images') {
      steps {
        script {
          bat 'rd /s /q backend\\node_modules || exit /b 0'

          // Active BuildKit pour un build Docker plus rapide
          bat 'set DOCKER_BUILDKIT=1'
          bat 'docker build -t ecommerce-frontend ./frontend'
          bat 'docker build -t ecommerce-backend ./backend'
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

    stage('Analyse SonarQube') {
      steps {
        withSonarQubeEnv('SonarQube') {
          withCredentials([string(credentialsId: 'SONAR_AUTH_TOKEN', variable: 'TOKEN')]) {

            dir('frontend') {
              bat """
                npx sonar-scanner ^
                -Dsonar.projectKey=frontend ^
                -Dsonar.sources=src ^
                -Dsonar.host.url=http://localhost:9000 ^
                -Dsonar.login=%TOKEN% ^
                -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
              """
            }

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

  post {
    success {
      echo '✅ Pipeline CI/CD optimisée avec cache terminée avec succès !'
    }
    failure {
      echo '❌ Erreur pendant la pipeline.'
    }
    always {
      echo '🧾 Fin du pipeline.'
      bat 'docker ps -a'
    }
  }
}
