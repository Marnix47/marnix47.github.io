class Alert {
    static alert(text){
        Swal.fire({
            html: Alert.textToHTML(text),
            theme: "bootstrap-4",
            customClass : {
                popup: "swal-container",
                container: "swal-container",
                confirmButton: "visible-swal-button"
            }
        });
    }

    static textToHTML(text){
        return `<p class="pop-up">${text}</p>`
    }

    static async confirm(text){
        // let fireResult;
        let result = await Swal.fire({
            html: Alert.textToHTML(text),
            showDenyButton: true,
            confirmButtonText: "OK",
            denyButtonText: "Annuleer",
            customClass : {
                popup: "swal-container",
                denyButton: "visible-swal-button",
                confirmButton: "visible-swal-button"
            },
        });
        console.log(result);
        return result.isConfirmed;
    }
}

window.Alert = Alert;

async function testAlert(){
    if(await Alert.confirm("HELLO?")){
        console.log("HI");
    } else {
        console.log("NO");
    }
}

// testAlert();