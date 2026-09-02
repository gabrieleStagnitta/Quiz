# 🕹️ Coding Party Duel

## 📖 Descrizione del Prototipo
Questo è un prototipo di un videogioco educativo multiplayer in tempo reale basato sulla programmazione a blocchi. 
In futuro spero di utilizzare questo prototipo per realizzare delle attività per le mie classi di Coding.

I giocatori assemblano visivamente il codice tramite un'interfaccia drag-and-drop; gli algoritmi generati vengono poi trasmessi al server centrale e tradotti in movimenti simultanei sullo schermo.

## ✨ Funzionalità Principali
* **Multiplayer Real-Time:** Sincronizzazione istantanea tra i client tramite WebSockets.
* **Sistema a Lobby:** Gestione sicura delle sessioni di gioco con assegnazione univoca dei ruoli (Giocatore 1 e Giocatore 2).
* **Motore a Blocchi:** Utilizzo di Google Blockly per la stesura del codice senza errori di sintassi.
* **Architettura Data-Driven:** I blocchi di programmazione (comandi e cicli) sono generati dinamicamente a runtime tramite la lettura di un file di configurazione `JSON`, garantendo un'estrema scalabilità e facilità di aggiornamento.

## 🛠️ Stack Tecnologico
* **Frontend:** HTML5, CSS3, JavaScript (Vanilla).
* **Librerie Client:** Google Blockly, Socket.IO Client.
* **Backend:** Node.js, Express.
* **Comunicazione:** Socket.IO per l'infrastruttura WebSocket bidirezionale.
* **Deploy:** Progettato per il rilascio in cloud tramite architettura PaaS (es. Render).
