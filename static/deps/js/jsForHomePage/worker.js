self.onmessage = function(event) {
    const task = event.data;
    console.log("get task", typeof task);
    let result;
    for(let i = 0; i < 100; i++) {
        console.log(i);

        if (i === 10){
            setTimeout(()=>{console.log(i)}, 5000)
             result = i
        }
    }


    self.postMessage(result); // Надсилаємо результат назад
};
