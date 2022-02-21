# rpcs3-game-updater
A minimal game update downloader for RPCS3, written w/ Node.

## USAGE
1. Download your platform-specific build (MacOS/Linux/Windows) from Releases.
2. Move the executable to a preferred directory (updates will be downloaded to the sub-directory UPDATES).
3. Run the executable and follow the instructions in-terminal (type in the game ID/serial).
4. Game updates for your specified game are stored in /UPDATES/{GAME NAME} - {GAME ID} once downloads complete. 
   Drag and drop each update onto the RPCS3 GUI, sequentially (1.1 -> 1.2 -> etc), to install.

## FAQ
Q: Why the large file size?  
A: We have to embed the Node.js runtime in these packages because I'm a web dev fool, and I simply don't know bash.
