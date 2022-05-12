---
title: webpack-playground-template
date: 
author: Mizok
version: 0.9.1
tags: 
---

## Introduction

A webpack boilerplate for playground exmaple showcase that uses `ejs` as the template engine.

[Check The Demo Here :D](https://mizok.github.io/webpack-playground-template/)

## Installation And Uasge

- Run `npm install` or `npm i` first to install all dependencies.
- Run `npm run dev` to start the dev-server.

### Where to put my playground examples entry `ejs` files?

You have to put your examples entry `ejs` files in `./src/examples/{YOUR_EXAMPLE_NAME}`, and you must name it `index.ejs`, so the full path will be `./src/examples/{YOUR_EXAMPLE_NAME}/index.ejs`.

### I would like to make some `ejs` files sharable as templates(ex:header.ejs)，how can I make this?

- You have to put your template `ejs` files in `./src/template`.
- In your `ejs` file which you want to insert your template:

```html
<%- include(`{YOUR_TEMPLATE_PATH(RELATIVE)}`) %>
```

for more detail, please check links below:

- https://github.com/dc7290/template-ejs-loader  
- https://ejs.bootcss.com/  

### What kind of files do I need to create a new example?

first you have to create a folder under `src/examples` for your new example.
then you will have to add these files into the new folder:
- an `index.ejs`
- an `index.ts` or add a `ts` folder then add an `index.ts` inside it. (Optional)
- an `main.scss` or add a `scss` folder then add an `main.scss` inside it. (Optional)

### I want to get webpack `mode` environment argument in `ejs` file, how can I make this?

Like this (in your `ejs` file) :

```ejs
<div><%= mode%></div> 
```

### My `img` tag is not showing because `webpack` seems to get my `src` wrong.

Check if you are using `alias` path , but not relative path, like below:

```html
<img src="~@img/logo.png">
```




