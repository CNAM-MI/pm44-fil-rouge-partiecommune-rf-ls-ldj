# myBDM_server
Le backend a été écrit en TypeScript pour l'échange avec le client à l'aide de Socket.io.

## Fonctionnement (voir vidéo dans dossier "demo video" pour plus de visuel) : 
Lorsque le serveur reçoit des messages de socket io, il exécute des fonctions avec Sequelize (ORM) pour intéragir avec la BDD qui est hébergé sur l'instance du VM ubuntu, elle même hébergée sur Oracle Cloud.
Une fois la requête effectuée à l'aide de Sequelize, le résultat est renvoyé par "emit" depuis une connection socket entre le client et le serveur.
Le client attend un certain type de message depuis la socket, puis le traite. 

### Toutes les requêtes ont été écrites côté back, mais ne sont pas toutes branchées côté front : 
-la création de compte, la connection à un compte, la création d'un sondage sont "branchées", sur l'application écrite avec "Ionic".
-Le reste n'a pas encore été "branché".
