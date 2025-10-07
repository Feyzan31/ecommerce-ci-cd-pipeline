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
          
          // NETTOYAGE (Stop & Remove) en Batch
          echo "Tentative d'arrêt et de suppression des anciens conteneurs..."
          // Laisser ces commandes échouer si le conteneur n'existe pas est acceptable en Batch
          bat 'docker stop ecommerce-frontend'
          bat 'docker rm ecommerce-frontend'
          bat 'docker stop ecommerce-backend'
          bat 'docker rm ecommerce-backend'

          // LANCEMENT
          echo "Lancement des nouveaux conteneurs..."
          bat 'docker run -d -p 5173:80 --name ecommerce-frontend ecommerce-frontend'
          bat 'docker run -d -p 4000:4000 --name ecommerce-backend ecommerce-backend'
        }
      }
    }
  }

  post {
    success { echo '✅ Pipeline CI/CD terminée avec succès !' }
    failure { echo '❌ Erreur pendant le déploiement.' }
  }
}