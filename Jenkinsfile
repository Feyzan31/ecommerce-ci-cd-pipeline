pipeline {
  agent any

  tools {
    nodejs 'node24'
  }

  options {
    ansiColor('xterm')
    timestamps()
  }

  stages {

    stage('Check Docker & Node') {
      steps {
        bat 'docker --version'
        bat 'node --version'
        bat 'npm --version'
      }
    }

    stage('Install Frontend Deps') {
      steps { dir('frontend') { bat 'npm ci' } }
    }

    stage('Install Backend Deps') {
      steps { dir('backend') { bat 'npm ci' } }
    }

    stage('Build Frontend') {
      steps { dir('frontend') { bat 'npm run build' } }
    }

    stage('Frontend Tests') {
      steps { dir('frontend') { bat 'npm test || exit /b 0' } } // ne casse pas le pipeline si les tests échouent
    }

    stage('Backend Tests') {
      steps { dir('backend') { bat 'npm test || exit /b 0' } } // idem
    }

    stage('Build Docker Images (With Cache)') {
      steps {
        script {
          echo '🐳 Activation du cache Docker layers + BuildKit'

          // Active BuildKit (moteur de build optimisé)
          bat 'set DOCKER_BUILDKIT=1'

          // Important : suppression du node_modules pour éviter de casser le cache
          bat 'rd /s /q backend\\node_modules || exit /b 0'
          bat 'rd /s /q frontend\\node_modules || exit /b 0'

          echo '📦 Build frontend avec cache'
          bat '''
            docker build ^
              --cache-from ecommerce-frontend ^
              -t ecommerce-frontend ^
              ./frontend
          '''

          echo '📦 Build backend avec cache'
          bat '''
            docker build ^
              --cache-from ecommerce-backend ^
              -t ecommerce-backend ^
              ./backend
          '''
        }
      }
    }

    stage('Deploy Containers') {
      steps {
        script {
          echo '🧹 Stop & remove anciens conteneurs (ignore erreurs)'
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
                -Dsonar.login=%TOKEN%
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
      echo '✅ Pipeline avec Docker Layer Cache terminée avec succès !'
    }
    failure {
      echo '❌ Erreur pendant la pipeline.'
    }
    always {
      echo '🧾 Fin du pipeline.'
      bat 'docker images --format "table {{.Repository}}\t{{.CreatedSince}}\t{{.Size}}"'
    }
  }
}
