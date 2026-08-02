const SUPABASE_URL =
"https://qlbgmbbudvykcdplvxxs.supabase.co";


const SUPABASE_KEY =
"sb_publishable_e1xK412znvhEPEAlPIWaSw_8SFKtAyO";


const client = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


let username = "";

const chat =
document.getElementById("chat");

const status =
document.getElementById("status");



document.getElementById("join").onclick = () => {

    username =
    document.getElementById("username")
    .value
    .trim();


    if(!username)
        return;


    document.getElementById("login-screen")
    .style.display="none";


    startChat();

};



async function startChat(){

    status.innerText="Connected";


    const {data,error}=await client
    .from("messages")
    .select("*")
    .order("created_at");


    if(error){

        alert(error.message);
        return;

    }


    data.forEach(showMessage);



    client
    .channel("messages")
    .on(
        "postgres_changes",
        {
            event:"INSERT",
            schema:"public",
            table:"messages"
        },
        payload=>{

            showMessage(payload.new);

        }
    )
    .subscribe();

}



function showMessage(msg){


    if(
        document.getElementById(
            "msg-"+msg.id
        )
    )
    return;



    let box=document.createElement("div");

    box.className="message";

    box.id="msg-"+msg.id;



    box.innerHTML=
    `
    <div class="username">
    ${msg.username}
    </div>
    `;



    if(msg.type==="text"){

        box.innerHTML +=
        `<div>${msg.content}</div>`;

    }



    if(msg.type==="image"){

        box.innerHTML +=
        `<img src="${msg.file_url}">`;

    }



    if(msg.type==="video"){

        box.innerHTML +=
        `<video controls src="${msg.file_url}"></video>`;

    }



    if(msg.type==="audio"){

        box.innerHTML +=
        `<audio controls src="${msg.file_url}"></audio>`;

    }



    if(msg.type==="file"){

        box.innerHTML +=
        `<a href="${msg.file_url}" target="_blank">
        ${msg.file_name}
        </a>`;

    }



    chat.appendChild(box);

    chat.scrollTop =
    chat.scrollHeight;

}




document.getElementById("send").onclick =
send;



async function send(){


    let text =
    document.getElementById("message");


    let file =
    document.getElementById("file")
    .files[0];



    if(file){


        let path =
        Date.now()+"-"+file.name;



        let upload =
        await client.storage
        .from("chat-files")
        .upload(path,file);



        if(upload.error){

            alert(upload.error.message);
            return;

        }



        let url =
        client.storage
        .from("chat-files")
        .getPublicUrl(path)
        .data.publicUrl;



        let type="file";


        if(file.type.startsWith("image"))
            type="image";

        if(file.type.startsWith("video"))
            type="video";

        if(file.type.startsWith("audio"))
            type="audio";



        await client
        .from("messages")
        .insert({

            username,
            type,
            file_url:url,
            file_name:file.name

        });



        document.getElementById("file").value="";

        return;

    }



    if(text.value.trim()){


        let result =
        await client
        .from("messages")
        .insert({

            username,
            content:text.value,
            type:"text"

        });



        if(result.error)
            alert(result.error.message);



        text.value="";

    }

}
