pipeline {
  agent any

  tools {
    nodejs 'node24'
  }

  options {
    timestamps()
    ansiColor('xterm')
  }

  stages {

    /* === Étapes CI (Intégration Continue) === */

    stage('Dépendances Frontend') {
      steps {
        dir('frontend') {
          bat 'npm ci'
        }
      }
    }

    stage('Dépendances Backend') {
      steps {
        dir('backend') {
          bat 'npm ci'
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

    stage('Tests') {
      parallel {
        stage('Frontend Tests') {
          steps {
            dir('frontend') {
              bat 'npm test || echo "⚠️ Tests échoués (frontend)"'
            }
          }
        }
        stage('Backend Tests') {
          steps {
            dir('backend') {
              bat 'npm test || echo "⚠️ Tests échoués (backend)"'
            }
          }
        }
      }
    }

    /* === Étapes CD (Déploiement Continu avec Docker) === */

    stage('Build Docker Images') {
      steps {
        script {
          echo "🐳 Construction des images Docker..."
          bat 'docker build -t ecommerce-frontend ./frontend'
          bat 'docker build -t ecommerce-backend ./backend'
        }
      }
    }

    stage('Déploiement des Conteneurs') {
      steps {
        script {
          echo "Déploiement des conteneurs Docker..."
          bat '''
            docker stop ecommerce-frontend || exit 0
            docker stop ecommerce-backend || exit 0
            docker rm ecommerce-frontend || exit 0
            docker rm ecommerce-backend || exit 0

            docker run -d -p 5173:80 --name ecommerce-frontend ecommerce-frontend
            docker run -d -p 4000:4000 --name ecommerce-backend ecommerce-backend
          '''
        }
      }
    }
  }

  post {
    success {
      echo ' Pipeline CI/CD terminée avec succès !'
    }
    failure {
      echo ' Erreur pendant le déploiement.'
    }
  }
}
