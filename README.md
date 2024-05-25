# myBDM_server
Pour faire tourner le serveur, il faut se placer à la racine et faire la commande 'node dist/server/server.js'. Il faut au préalable installer npm et nodejs. 

Le client implémenté ici est en TS. Il est là pour tester l'envoi de message de la part du serveur, soit server.ts. 

Les clients sont différents, et doivent tous utiliser socket.io. 
Que ce soit pour MAUI, il y a une bibliothèque C# pour le client avec socket io, et pour Kotlin, il y a une bibliothèque Java et une Kotlin également. 
Voir sur ce lien : 
https://socket.io/docs/v4/

Il y a un code TS et un code JS, c'est normal. Les navigateurs ne compilent ni ne peuvent lancer du TS, donc j'utilise la commande 'tsc' de nodejs pour convertir le code TS en JS. 
