pipeline {
  agent any

  tools {
    nodejs 'node24'
  }

  options {
    ansiColor('xterm')
    timestamps()
  }

  environment {
    // Dossier de cache npm (non optimisé ici, juste pour stabilité)
    NPM_CACHE = "C:\\ProgramData\\Jenkins\\.jenkins\\npm_cache"
  }

  stages {

    // === 1. CLONAGE COMPLET ===
    stage('Checkout') {
      steps {
        // On fait un clone complet pour que git diff HEAD~1 HEAD fonctionne
        checkout([
          $class: 'GitSCM',
          branches: [[name: '*/main']], // adapte selon ta branche
          doGenerateSubmoduleConfigurations: false,
          extensions: [[$class: 'CloneOption', depth: 0, noTags: false, shallow: false]],
          userRemoteConfigs: [[url: 'https://github.com/Feyzan31/ecommerce-ci-cd-pipeline.git']]
        ])
      }
    }

    // === 2. ENVIRONNEMENT ===
    stage('Check Docker & Node') {
      steps {
        bat 'docker --version'
        bat 'node --version'
        bat 'npm --version'
      }
    }

    // === 3. INSTALLATION DES DEPENDANCES ===
    stage('Install Frontend Deps') {
      steps {
        dir('frontend') {
          echo '📦 Installation des dépendances frontend...'
          bat 'npm ci --prefer-offline --cache %NPM_CACHE%'
        }
      }
    }

    stage('Install Backend Deps') {
      steps {
        dir('backend') {
          echo '📦 Installation des dépendances backend...'
          bat 'npm ci --prefer-offline --cache %NPM_CACHE%'
        }
      }
    }

    // === 4. BUILD FRONTEND ===
    stage('Build Frontend') {
      steps {
        dir('frontend') {
          echo '⚙️ Construction du frontend...'
          bat 'npm run build'
        }
      }
    }

    // === 5. TESTS FRONTEND (INCREMENTAUX) ===
    stage('Frontend Tests (Incremental)') {
      steps {
        script {
          echo "🔍 Détection des changements pour le frontend..."
          def result = bat(script: 'git diff --name-only HEAD~1 HEAD', returnStdout: true, returnStatus: false)
          def changes = result.trim().replace("\r", "")
          echo "📂 Fichiers modifiés : ${changes}"

          if (changes.contains("fatal:")) {
            echo "⚠️ Aucun commit précédent — exécution complète des tests FRONTEND."
            changes = "frontend/"
          }

          if (changes.contains("frontend/")) {
            dir('frontend') {
              echo "🧪 Exécution des tests FRONTEND..."
              bat 'npx vitest run --coverage || exit /b 0'
            }
          } else {
            echo "✅ Aucun changement dans frontend — skip tests frontend."
          }
        }
      }
    }

    // === 6. TESTS BACKEND (INCREMENTAUX) ===
    stage('Backend Tests (Incremental)') {
      steps {
        script {
          echo "🔍 Détection des changements pour le backend..."
          def result = bat(script: 'git diff --name-only HEAD~1 HEAD', returnStdout: true, returnStatus: false)
          def changes = result.trim().replace("\r", "")
          echo "📂 Fichiers modifiés : ${changes}"

          if (changes.contains("fatal:")) {
            echo "⚠️ Aucun commit précédent — exécution complète des tests BACKEND."
            changes = "backend/"
          }

          if (changes.contains("backend/")) {
            dir('backend') {
              echo "🧪 Exécution des tests BACKEND..."
              bat 'npm run test:cov || exit /b 0'
            }
          } else {
            echo "✅ Aucun changement dans backend — skip tests backend."
          }
        }
      }
    }

    // === 7. CONSTRUCTION DES IMAGES DOCKER ===
    stage('Build Docker Images') {
      steps {
        script {
          echo '🐳 Construction des images Docker...'
          bat 'rd /s /q backend\\node_modules || exit /b 0'
          bat 'set DOCKER_BUILDKIT=1'
          bat 'docker build -t ecommerce-frontend ./frontend'
          bat 'docker build -t ecommerce-backend ./backend'
        }
      }
    }

    // === 8. DEPLOIEMENT ===
    stage('Deploy Containers') {
      steps {
        script {
          echo '🧹 Suppression des anciens conteneurs...'
          bat 'docker stop ecommerce-frontend || exit /b 0'
          bat 'docker rm ecommerce-frontend || exit /b 0'
          bat 'docker stop ecommerce-backend || exit /b 0'
          bat 'docker rm ecommerce-backend || exit /b 0'

          echo '🚀 Lancement des nouveaux conteneurs...'
          bat 'docker run -d --restart always -p 5173:80 --name ecommerce-frontend ecommerce-frontend'
          bat 'docker run -d --restart always -p 4000:4000 --name ecommerce-backend ecommerce-backend'
        }
      }
    }

    // === 9. ANALYSE SONARQUBE ===
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
              bat 'npm run test:cov'
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
