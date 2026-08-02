const SUPABASE_URL = "https://qlbgmbbudvykcdplvxxs.supabase.co";
const SUPABASE_KEY = "sb_publishable_e1xK412znvhEPEAlPIWaSw_8SFKtAyO";

const db = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

let username = "";

const messages = document.getElementById("messages");


function join(){

    username =
        document.getElementById("username").value.trim();

    if(!username) return;

    document.getElementById("login").style.display="none";

    document.getElementById("status").innerText =
        "Connected";

    loadMessages();
}


async function loadMessages(){

    const {data} =
        await db
        .from("messages")
        .select("*")
        .order("created_at");

    data.forEach(addMessage);


    db.channel("chat")
    .on(
        "postgres_changes",
        {
            event:"INSERT",
            schema:"public",
            table:"messages"
        },
        payload=>{
            addMessage(payload.new);
        }
    )
    .subscribe();
}



function addMessage(msg){

    if(document.getElementById("m"+msg.id))
        return;

    let div=document.createElement("div");

    div.className="message";
    div.id="m"+msg.id;


    div.innerHTML =
    `<div class="user">${msg.username}</div>`;


    if(msg.type==="text"){

        div.innerHTML +=
        `<div>${msg.content}</div>`;

    }


    if(msg.type==="image"){

        div.innerHTML +=
        `<img src="${msg.file_url}">`;

    }


    if(msg.type==="video"){

        div.innerHTML +=
        `<video controls src="${msg.file_url}"></video>`;

    }


    if(msg.type==="audio"){

        div.innerHTML +=
        `<audio controls src="${msg.file_url}"></audio>`;

    }


    if(msg.type==="file"){

        div.innerHTML +=
        `<a href="${msg.file_url}" target="_blank">
        ${msg.file_name}
        </a>`;

    }


    messages.appendChild(div);

    messages.scrollTop =
        messages.scrollHeight;
}



async function send(){

    let text =
    document.getElementById("text");

    let file =
    document.getElementById("file").files[0];


    if(file){

        let path =
        Date.now()+"-"+file.name;


        await db.storage
        .from("chat-files")
        .upload(path,file);


        let url =
        db.storage
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


        await db.from("messages").insert({

            username,
            type,
            file_url:url,
            file_name:file.name

        });


        document.getElementById("file").value="";

        return;
    }



    if(text.value.trim()){

        await db.from("messages").insert({

            username,
            type:"text",
            content:text.value

        });

        text.value="";
    }

}
