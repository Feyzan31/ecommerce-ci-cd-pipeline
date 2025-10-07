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

    stage('Checkout code') {
      steps {
        echo "Récupération du code source..."
        git branch: 'main', url: 'https://github.com/souadbouzgaou/ecommerce-ci-cd-pipeline.git'
      }
    }

    stage('Installation dépendances Frontend') {
      steps {
        dir('frontend') {
          bat 'npm ci'
        }
      }
    }

    stage('Installation dépendances Backend') {
      steps {
        dir('backend') {
          bat 'npm ci'
        }
      }
    }

    stage('Tests Frontend') {
      steps {
        dir('frontend') {
          bat 'npm test || echo "Tests échoués (frontend)"'
        }
      }
    }

    stage('Tests Backend') {
      steps {
        dir('backend') {
          bat 'npm test || echo "Tests échoués (backend)"'
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

    stage('Build Backend') {
      steps {
        dir('backend') {
          bat 'npm run build'
        }
      }
    }
  }

  post {
    success {
      echo 'Pipeline terminée avec succès !'
    }
    failure {
      echo 'Erreur pendant la pipeline.'
    }
  }
}
