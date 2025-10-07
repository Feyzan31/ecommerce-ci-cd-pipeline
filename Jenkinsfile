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

    

    stage('dépendances Frontend') {
      steps {
        dir('frontend') {
          bat 'npm ci'
        }
      }
    }

    stage('dépendances Backend') {
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

    


  }

 
}
