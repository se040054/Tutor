# Tutor-API

家教平台網頁實作 

API文件參考:https://docs.google.com/spreadsheets/d/1TZFlstGAYEaaMb0gSo8ZxiZXvsUxBfdVPncaITChgqY/edit#gid=1381379513

# How to use ? 

1.
```
$ cd ...

```
2.
```
$ git clone https://github.com/se040054/Tutor-API
```
3.
```
$ cd Tutor-API
```
4.
```
$ npm install
```
5.
Rename the 'example.env' file located in '/environment/prod/' directory to '.env'.

( If you need to do development work, perform the same steps in'/environment/dev/' )

6.
**modify directory**
```
├── app.js
└── public 
    ├── images 
    └── upload 
```

7.
MySQL:
```
CREATE DATABESE tutor
```
Set the 'config.json' file for connecting to the MySQL server.

```
npm run migrate 
npm run seed
```
just wait for minutes

8. 

```
npm run start
```
If you see http://localhost:3000 in the command prompt, it means it was successful.
 

---

#### After following the steps above , this application needs to be excuted within this : 
https://github.com/se040054/Tutor-Frontend




