'use strict';

var express = require('express');
var app = express();

app.use(express.static(__dirname));
app.use('/static', express.static(__dirname + '/../dist'));
app.use('/lib', express.static(__dirname + '/../bower_components'));

app.listen(process.env.PORT || 3000);
console.log('Escuchando el puerto 3000');