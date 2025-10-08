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

    stage('Install Dependencies') {
      parallel {
        stage('Frontend Deps') {
          steps { dir('frontend') { bat 'npm ci' } }
        }
        stage('Backend Deps') {
          steps { dir('backend') { bat 'npm ci' } }
        }
      }
    }

    stage('Build Docker Images with Layer Cache') {
      steps {
        script {
          echo "🧱 Activation du cache Docker layers"

          // Active BuildKit (moteur de cache amélioré)
          bat 'set DOCKER_BUILDKIT=1'

          // Frontend
          bat '''
            docker build ^
              --cache-from ecommerce-frontend ^
              -t ecommerce-frontend ^
              ./frontend
          '''

          // Backend
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
          echo "🧹 Nettoyage des anciens conteneurs"
          bat 'docker stop ecommerce-frontend || exit /b 0'
          bat 'docker rm ecommerce-frontend || exit /b 0'
          bat 'docker stop ecommerce-backend || exit /b 0'
          bat 'docker rm ecommerce-backend || exit /b 0'

          echo "🚀 Déploiement des nouveaux conteneurs"
          bat 'docker run -d --restart always -p 5173:80 --name ecommerce-frontend ecommerce-frontend'
          bat 'docker run -d --restart always -p 4000:4000 --name ecommerce-backend ecommerce-backend'
        }
      }
    }
  }

  post {
    success {
      echo "✅ Build avec Docker Layer Cache terminée avec succès"
    }
    failure {
      echo "❌ Erreur pendant le build Docker"
    }
  }
}
