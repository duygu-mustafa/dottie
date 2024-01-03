# Dottie
Enhancing Dotted Chart Visualization for Object-Centric Event Data Analysis in Process Mining

# Deployment

## Docker-Compose
 
```bash
docker-compose build
docker-compose up
```
After this the frontend is available at http://localhost:3000 and the backend at http://localhost:5000

## Not Docker-Compose
start two terminals
### 1st terminal
```bash
cd frontend
npm start
```
### 2nd terminal
```bash
cd backend
python3 app.py 
```