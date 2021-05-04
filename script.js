window.addEventListener('load',()=>{
    const canvas = document.querySelector('#canvas');
    const ctx = canvas.getContext('2d');
    //ctx.fillRect(0, 0, canvas.width, canvas.height);
    let painting = false;
    function startPosition(e){
        painting = true;
        doodle(e);
    }
    function endPosition(){
        painting = false;
        ctx.beginPath();
    }
    function doodle(e){
        if(!painting) return;
        ctx.lineWidth =8;
        ctx.lineCap = 'round';
        //ctx.lineTo(e.clientX- canvas.offsetLeft, e.clientY- canvas.offsetTop);
        ctx.lineTo(e.clientX-195, e.clientY-270);
        ctx.stroke();
        //ctx.beginPath();
        //ctx.moveTo(e.clientX-195, e.clientY-245);

    }
    canvas.addEventListener('mousedown',startPosition);
    canvas.addEventListener('mouseup',endPosition);
    canvas.addEventListener('mousemove',doodle);
    
});

function gray(imgObj) {
    var canvas = document.createElement('canvas');
    var canvasContext = canvas.getContext('2d');
     
    var imgW = imgObj.width;
    var imgH = imgObj.height;
    canvas.width = imgW;
    canvas.height = imgH;
     
    canvasContext.drawImage(imgObj, 0, 0);
    var imgPixels = canvasContext.getImageData(0, 0, imgW, imgH);
     
    for(var y = 0; y < imgPixels.height; y++){
        for(var x = 0; x < imgPixels.width; x++){
            var i = (y * 4) * imgPixels.width + x * 4;
            var avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
            imgPixels.data[i] = avg; 
            imgPixels.data[i + 1] = avg; 
            imgPixels.data[i + 2] = avg;
        }
    }
    canvasContext.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
    return canvas.toDataURL();
}
function cropImage(img, width=400){
    img = img.slice([0,0,3])
    var mask_x = tf.greater(img.sum(0), 0).reshape([-1])
    var mask_y = tf.greater(img.sum(1), 0).reshape([-1])
    var st = tf.stack([mask_x,mask_y])
    var v1 = tf.topk(st)
    var v2 = tf.topk(st.reverse())
    
    var [x1, y1] = v1.indices.dataSync()
    var [y2, x2] = v2.indices.dataSync()
    y2 = width-y2-1
    x2 = width-x2-1
    var crop_w = x2-x1
    var crop_h = y2-y1
    
    if (crop_w > crop_h) {
        y1 -= (crop_w - crop_h) / 2
        crop_h = crop_w
    }
    if (crop_h > crop_w) {
        x1 -= (crop_h - crop_w) / 2
        crop_w = crop_h
    }
    
    img = img.slice([y1,x1],[crop_h,crop_w ])
    img = img.pad([[6,6],[6,6],[0,0]])
    var resized = tf.image.resizeNearestNeighbor(img,[28, 28])
    
    for(let i = 0; i < 28*28; i++) {
        resized[i] = 255 - resized[i]
    }
    return resized
}

async function getPred(){
    const model = await tf.loadLayersModel('model.json');
    var canvas=$('#canvas')[0];
    var preview = $('#preview-canvas')[0];
    var img=tf.browser.fromPixels(canvas,4);
    var resized = cropImage(img, canvas.width);  
    tf.browser.toPixels(resized, preview);
    var x_data = tf.cast(resized.reshape([1, 28, 28, 1]), 'float32');
    var predictions = await model.predict(x_data).dataSync();    
    // var canvas = document.querySelector('#canvas');
    // const ctx = canvas.getContext('2d');
    // image = document.getElementById('picture')
    // image.src = canvas.toDataURL();
    // image.width=28;
    // image.height=28;
    
    //const prepro=tf.browser.fromPixels(image)     
    //const predictions=await model.predict(prepro.reshape([1,28,28,3])).dataSync();
    
    console.log(predictions);
    var classes=["Aircraft carrier","Helicopter","Ambulance","Bulldozer","Bus","Canoe","Car","Cruise ship","Firetruck","Flying saucer","Airplane","Hot air balloon","Pickup truck","Sailboat","Speedboat","Train"];
    for(index=0;index<classes.length;index++){
        const className=classes[index];
        const probability1=predictions[index];
        const probability=(probability1*100).toFixed(5);

        if (probability>=25) {
            $('#prediction-list').append('<b><li>'+className+' | Confidence : '+probability+'</li></b>')
          } else {
            $('#prediction-list').append('<li>'+className+' | Confidence : '+probability+'%'+'</li>')
          }
    }
    const barchartData = Array.from(predictions).map((d, i) => {
        document.getElementById("predict-graph").style.visibility = "visible";

        return { index: i, value: d }
        
    })
    tfvis.render.barchart($('#predict-graph')[0], barchartData,  { width: 400, height: 140 }) 

    
      
        


    x_data.dispose();
    resized.dispose();


}

function clrscr(){
    var m = confirm("Want to clear?");
    if (m) {
        const canvas = document.querySelector('#canvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        $("#prediction-list").empty();
        const canvas2 = document.querySelector('#preview-canvas');
        const ctx1 = canvas2.getContext('2d');
        ctx1.clearRect(0, 0, canvas2.width, canvas2.height);
        document.getElementById("predict-graph").style.visibility = "hidden";


        console.log(200)
         }
}




































// var canvas, ctx, flag = false,
//         prevX = 0,
//         currX = 0,
//         prevY = 0,
//         currY = 0,
//         dot_flag = false;

//     var x = "black",
//         y = 2;
    
//     function init() {
//         canvas = document.getElementById('can');
//         ctx = canvas.getContext("2d");
//         w = canvas.width;
//         h = canvas.height;
    
//         canvas.addEventListener("mousemove", function (e) {
//             findxy('move', e)
//         }, false);
//         canvas.addEventListener("mousedown", function (e) {
//             findxy('down', e)
//         }, false);
//         canvas.addEventListener("mouseup", function (e) {
//             findxy('up', e)
//         }, false);
//         canvas.addEventListener("mouseout", function (e) {
//             findxy('out', e)
//         }, false);
//     }
    
//     function color(obj) {
//         switch (obj.id) {
//             case "green":
//                 x = "green";
//                 break;
//             case "blue":
//                 x = "blue";
//                 break;
//             case "red":
//                 x = "red";
//                 break;
//             case "yellow":
//                 x = "yellow";
//                 break;
//             case "orange":
//                 x = "orange";
//                 break;
//             case "black":
//                 x = "black";
//                 break;
//             case "white":
//                 x = "white";
//                 break;
//         }
//         if (x == "white") y = 14;
//         else y = 2;
    
//     }
    
//     function draw() {
//         ctx.beginPath();
//         ctx.moveTo(prevX, prevY);
//         ctx.lineTo(currX, currY);
//         ctx.strokeStyle = x;
//         ctx.lineWidth = y;
//         ctx.stroke();
//         ctx.closePath();
//     }
    
//     function erase() {
//         var m = confirm("Want to clear");
//         if (m) {
//             ctx.clearRect(0, 0, w, h);
//             document.getElementById("canvasimg").style.display = "none";
//         }
//     }
    
//     function save() {
//         document.getElementById("canvasimg").style.border = "2px solid";
//         var dataURL = canvas.toDataURL();
//         document.getElementById("canvasimg").src = dataURL;
//         document.getElementById("canvasimg").style.display = "inline";
//     }
    
//     function findxy(res, e) {
//         if (res == 'down') {
//             prevX = currX;
//             prevY = currY;
//             currX = e.clientX - canvas.offsetLeft;
//             currY = e.clientY - canvas.offsetTop;
    
//             flag = true;
//             dot_flag = true;
//             if (dot_flag) {
//                 ctx.beginPath();
//                 ctx.fillStyle = x;
//                 ctx.fillRect(currX, currY, 2, 2);
//                 ctx.closePath();
//                 dot_flag = false;
//             }
//         }
//         if (res == 'up' || res == "out") {
//             flag = false;
//         }
//         if (res == 'move') {
//             if (flag) {
//                 prevX = currX;
//                 prevY = currY;
//                 currX = e.clientX - canvas.offsetLeft;
//                 currY = e.clientY - canvas.offsetTop;
//                 draw();
//             }
//         }
//}
