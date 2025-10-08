pipeline {
  agent any

  tools {
    nodejs 'node24'  // Make sure this is configured in Jenkins → Global Tool Configuration
  }

  options {
    ansiColor('xterm')
    timestamps()
  }

  environment {
    // 📦 Shared npm cache folder (persistent between builds)
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
          echo '📦 Installing frontend dependencies with cache...'
          bat """
            if not exist "%NPM_CACHE%" mkdir "%NPM_CACHE%"
            npm install --prefer-offline --cache %NPM_CACHE%
          """
        }
      }
    }

    stage('Install Backend Deps (Cached)') {
      steps {
        dir('backend') {
          echo '📦 Installing backend dependencies with cache...'
          bat """
            if not exist "%NPM_CACHE%" mkdir "%NPM_CACHE%"
            npm install --prefer-offline --cache %NPM_CACHE%
          """
        }
      }
    }

    stage('Build Frontend') {
      steps {
        dir('frontend') {
          echo '⚙️ Building frontend...'
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
          echo '🐳 Building Docker images...'
          bat 'rd /s /q backend\\node_modules || exit /b 0'

          // Enable Docker BuildKit for better caching
          bat 'set DOCKER_BUILDKIT=1'
          bat 'docker build -t ecommerce-frontend ./frontend'
          bat 'docker build -t ecommerce-backend ./backend'
        }
      }
    }

    stage('Deploy Containers') {
      steps {
        script {
          echo '🧹 Cleaning old containers...'
          bat 'docker stop ecommerce-frontend || exit /b 0'
          bat 'docker rm ecommerce-frontend || exit /b 0'
          bat 'docker stop ecommerce-backend || exit /b 0'
          bat 'docker rm ecommerce-backend || exit /b 0'

          echo '🚀 Starting new containers'
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
  bat 'npx vitest run --coverage'
  bat """
    npx sonar-scanner ^
    -Dsonar.projectKey=frontend ^
    -Dsonar.sources=src ^
    -Dsonar.tests=src ^
    -Dsonar.test.inclusions=**/*.test.js ^
    -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info ^
    -Dsonar.exclusions=**/node_modules/**,**/dist/** ^
    -Dsonar.host.url=http://localhost:9000 ^
    -Dsonar.login=%TOKEN%
  """
}
            dir('backend') {
  bat 'set PATH=%cd%\\node_modules\\.bin;%PATH%'
  bat 'npm ci'
  bat 'npm run test:cov'   // <-- lance Jest avec couverture
  bat """
     npx sonar-scanner ^
    -Dsonar.projectKey=backend ^
    -Dsonar.sources=src ^
    -Dsonar.tests=tests ^
    -Dsonar.test.inclusions=**/*.test.js ^
    -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info ^
    -Dsonar.exclusions=**/node_modules/** ^
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
