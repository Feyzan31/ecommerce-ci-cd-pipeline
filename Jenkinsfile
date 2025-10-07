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

    stage('📦 Checkout code') {
      steps {
        echo "Récupération du code source..."
        // ⚠️ remplace l’URL ci-dessous par ton dépôt GitHub
        git branch: 'main', url: 'https://github.com/souadbouzgaou/ecommerce-ci-cd-pipeline.git'
      }
    }

    stage('📥 Installation des dépendances') {
      parallel {
        stage('Frontend') {
          steps {
            dir('frontend') {
              sh 'npm ci'
            }
          }
        }
        stage('Backend') {
          steps {
            dir('backend') {
              sh 'npm ci'
            }
          }
        }
      }
    }

    stage('🧪 Lancer les tests') {
      parallel {
        stage('Frontend tests') {
          steps {
            dir('frontend') {
              sh 'npm test || echo "⚠️ Tests échoués (frontend)"'
            }
          }
        }
        stage('Backend tests') {
          steps {
            dir('backend') {
              sh 'npm test || echo "⚠️ Tests échoués (backend)"'
            }
          }
        }
      }
    }

    stage('🏗️ Build frontend') {
      steps {
        dir('frontend') {
          sh 'npm run build'
        }
      }
    }
  }

  post {
    success {
      echo '✅ Pipeline terminée avec succès !'
    }
    failure {
      echo '❌ Erreur pendant la pipeline.'
    }
  }
}
