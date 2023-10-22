document.addEventListener('DOMContentLoaded', function () {

	// POST Email
	document.querySelector("#compose-form").onsubmit = function () {
		send_recipients = document.querySelector("#compose-recipients").value;
		send_subject = document.querySelector("#compose-subject").value;
		send_body = document.querySelector("#compose-body").value;

		fetch("/emails", {
			method: "POST",
			body: JSON.stringify({
				recipients: send_recipients,
				subject: send_subject,
				body: send_body,
			})
		})
			.then(response => response.json())
			.then(email => {
				console.log(email)
			})

	}

	// Use buttons to toggle between views
	document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
	document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
	document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
	document.querySelector('#compose').addEventListener('click', compose_email);

	// By default, load the inbox
	load_mailbox('inbox');

});

function show_email(email_id){
	fetch(`/emails/${email_id}`)
	.then(response => response.json())
	.then(email => {
		document.querySelector(".inside").innerHTML = `
		<p>
			<strong> From: </strong> ${email.sender} <br>
			<strong> To: </strong> ${email.recipients[0]} <br>
			<strong> Subject: </strong> ${email.subject} <br> 
			<strong> Timestamp: </strong> ${email.timestamp} <br>
		</p>
		<button class="email-btn">Reply</button>
		<button class="archive-btn">Archive</button>`
		if (email.archived === false){
			document.querySelector(".archive-btn").innerHTML = "Archive"
		} else {
			document.querySelector(".archive-btn").innerHTML = "Unarchive"
		}

		document.querySelector(".p-body").innerHTML = email.body
		
		document.querySelector(".email-btn").onclick = () => {
			let reply = true
			compose_email(reply, email)
		}

		document.querySelector(".archive-btn").onclick = () => {
			if (email.archived === false){
				email_status(email.id, true)
			} else {
				email_status(email.id, false)
			}
			location.reload();
		}

		document.querySelector('#show-email').style.display = 'block';
		document.querySelector('#emails-view').style.display = 'none';
		document.querySelector('#compose-view').style.display = 'none';
	})
}

function email_status(email_id, archive_status){
	fetch(`/emails/${email_id}`, {
		method: "PUT",
		body: JSON.stringify({
			archived: archive_status,
		})
	})
}

function email_read(email_id){
	fetch(`/emails/${email_id}`, {
		method: "PUT",
		body: JSON.stringify({
			read: true,
		})
	})
}


function compose_email(reply, email) {
	// Show compose view and hide other views
	document.querySelector('#emails-view').style.display = 'none';
	document.querySelector('#show-email').style.display = 'none';
	document.querySelector('#compose-view').style.display = 'block';

	// Clear out composition fields
	if (reply === true){
		
		document.querySelector('#compose-recipients').value = email.sender;
		if (email.subject.slice(0,3) === "Re:"){
			document.querySelector('#compose-subject').value = `${email.subject}`;
		} else {
			document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
		}
		document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body} \n`;
	} else {
		document.querySelector('#compose-recipients').value = '';
		document.querySelector('#compose-subject').value = '';
		document.querySelector('#compose-body').value = '';
	}
}

function load_mailbox(mailbox) {
	fetch(`/emails/${mailbox}`)
	.then(response => response.json())
	.then(emails => {
		let user = document.querySelector("#user").innerHTML
		emails.forEach(email => {
			console.log(email)
			let div = document.createElement("div");
			// div.className = `email-${email.id}`;
			div.style.cssText = "margin-bottom: 10px; border: 1px solid black;"
			div.addEventListener("click", () => {
				email_read(email.id)
				show_email(email.id)
			})
			div.insertAdjacentHTML('beforeend', `<h5>${email.sender} <strong>${email.subject}</strong> </h5> ${email.timestamp}`);

			if (email.read === true){
				div.style.backgroundColor = "rgba(128, 128, 128, 0.205)"
			}

			if (email.sender === user && mailbox === "sent"){
				document.querySelector("#emails-view").append(div);
				div.style.backgroundColor = "white";
			} else if (email.archived === true && mailbox === "archive"){
				document.querySelector("#emails-view").append(div);
				div.style.backgroundColor = "rgba(255, 255, 16, 0.116)";
			} else {
				document.querySelector("#emails-view").append(div);
			}
		})
	})

	// Show the mailbox and hide other views
	document.querySelector('#emails-view').style.display = 'block';
	document.querySelector('#show-email').style.display = 'none';
	document.querySelector('#compose-view').style.display = 'none';

	// Show the mailbox name
	document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}

