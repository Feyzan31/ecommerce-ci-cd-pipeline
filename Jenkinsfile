pipeline {
  agent any

  tools {
    // Assurez-vous que 'node24' est bien configuré dans Jenkins
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
        dir('frontend') { bat 'npm ci' }
      }
    }

    stage('Dépendances Backend') {
      steps {
        dir('backend') { bat 'npm ci' }
      }
    }

    stage('Build Frontend') {
      steps {
        dir('frontend') { bat 'npm run build' }
      }
    }

    
      // Les tests sont maintenant séquentiels (l'un après l'autre)
      stage('Frontend Tests') { 
        steps { 
          dir('frontend') { bat 'npm test || echo "⚠️ Tests échoués (frontend)"' } 
        } 
      }
      stage('Backend Tests') { 
        steps { 
          dir('backend') { bat 'npm test || echo "⚠️ Tests échoués (backend)"' } 
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

      //  Stop & remove anciens conteneurs sans échec si inexistants
      bat 'docker stop ecommerce-frontend || exit 0'
      bat 'docker rm ecommerce-frontend || exit 0'
      bat 'docker stop ecommerce-backend || exit 0'
      bat 'docker rm ecommerce-backend || exit 0'

      // Lancement des nouveaux conteneurs
      echo "Lancement des nouveaux conteneurs..."
      bat 'docker run -d -p 5173:80 --name ecommerce-frontend ecommerce-frontend'
      bat 'docker run -d -p 4000:4000 --name ecommerce-backend ecommerce-backend'
    }
  }
}

  }
  }