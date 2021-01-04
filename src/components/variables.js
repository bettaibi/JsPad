'use strict';

let htmlDocument = `
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    <body>

    </body>
</html>`;
        
let jsDoc = 
`
/***
    Tap CTRL+S to save your progress, Or Click on the 'save' button in the above dropdown.
 ***/
`;

let cssDoc = 
`
*{
    box-sizing: border-box;
}

html, body{
    width:100%;
    margin: 0;
    padding: 1rem;
    /*   background-color: #fff; */
}`;

export {jsDoc, htmlDocument, cssDoc};