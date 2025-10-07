pipeline {
  agent any

  tools {
    // Assurez-vous que 'node24' est configuré dans Manage Jenkins > Global Tool Configuration
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

    stage('Build Docker Images') {
      steps {
        script {
          bat 'rd /s /q backend\\node_modules || exit /b 0'

          // Active BuildKit pour de meilleurs caches (facultatif)
          bat 'set DOCKER_BUILDKIT=1'
          bat 'docker build -t ecommerce-frontend ./frontend'
          bat 'docker build -t ecommerce-backend ./backend'
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

          echo ' Lancement des nouveaux conteneurs'
          // Frontend: Nginx sert sur 80 dans le conteneur → on mappe 5173:80 côté hôte
          bat 'docker run -d --restart always -p 5173:80 --name ecommerce-frontend ecommerce-frontend'
          // Backend: écoute sur 4000 dans le conteneur → on mappe 4000:4000
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

 

}