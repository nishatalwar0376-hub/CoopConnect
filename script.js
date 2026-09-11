// ==========================================
// CUSTOMER / WORKER ROLE
// ==========================================

function selectRole(role) {

    document.querySelectorAll(".customer-only")
        .forEach(function(element) {
            element.style.display = "none";
        });

    document.querySelectorAll(".worker-only")
        .forEach(function(element) {
            element.style.display = "none";
        });


    // CUSTOMER
    if (role === "customer") {

        document.querySelectorAll(".customer-only")
            .forEach(function(element) {
                element.style.display = "block";
            });

        document.getElementById("roleMessage").innerText =
            "👤 Customer mode: Post requests and contact workers.";

        localStorage.setItem("userRole", "customer");
    }


    // WORKER
    if (role === "worker") {

        document.querySelectorAll(".worker-only")
            .forEach(function(element) {
                element.style.display = "inline-block";
            });

        document.querySelectorAll("section.worker-only")
            .forEach(function(element) {
                element.style.display = "block";
            });

        document.getElementById("roleMessage").innerText =
            "👷 Worker mode: Register, accept requests and receive contact requests.";

        localStorage.setItem("userRole", "worker");
    }
}


// ==========================================
// LOAD SAVED ROLE
// ==========================================

window.addEventListener("DOMContentLoaded", function() {

    const savedRole = localStorage.getItem("userRole");

    if (savedRole) {
        selectRole(savedRole);
    }

});


// ==========================================
// NAVIGATION
// ==========================================

function goToRequest() {

    document.getElementById("request")
        .scrollIntoView({
            behavior: "smooth"
        });

}


function goToWorkers() {

    document.getElementById("workers")
        .scrollIntoView({
            behavior: "smooth"
        });

}


// ==========================================
// CHOOSE SERVICE
// ==========================================

function chooseService(service) {

    const role = localStorage.getItem("userRole");

    if (role !== "customer") {

        alert(
            "Please select Customer mode to post a request."
        );

        return;
    }

    document.getElementById("service").value = service;

    goToRequest();
}


// ==========================================
// SUBMIT SERVICE REQUEST
// ==========================================

const serviceForm =
    document.getElementById("serviceForm");


if (serviceForm) {

    serviceForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();

            const name =
                document.getElementById("name").value;

            const service =
                document.getElementById("service").value;

            const userLocation =
                document.getElementById("location").value;

            const description =
                document.getElementById("description").value;


            fetch("/submit_request", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    name: name,
                    service: service,
                    location: userLocation,
                    description: description

                })

            })

            .then(function(response) {
                return response.json();
            })

            .then(function(data) {

                if (data.success) {

                    alert(
                        "Service request submitted successfully! ✅"
                    );

                    serviceForm.reset();

                    window.location.reload();
                }

            })

            .catch(function(error) {

                console.error(error);

                alert(
                    "Something went wrong. Please try again. ❌"
                );

            });

        }
    );

}


// ==========================================
// ACCEPT SERVICE REQUEST
// ==========================================

function acceptRequest(button) {

    const role =
        localStorage.getItem("userRole");


    if (role !== "worker") {

        alert(
            "Only a worker can accept a request."
        );

        return;
    }


    const card =
        button.closest(".request-card");


    const requestId =
        card.dataset.id;


    fetch(
        "/update_status/" + requestId,
        {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                status: "Accepted"
            })

        }
    )

    .then(function(response) {
        return response.json();
    })

    .then(function(data) {

        if (data.success) {

            alert(
                "Request accepted successfully! 👷✅"
            );

            window.location.reload();
        }

    })

    .catch(function(error) {

        console.error(error);

        alert(
            "Could not accept request. ❌"
        );

    });

}


// ==========================================
// COMPLETE REQUEST
// ==========================================

function completeRequest(button) {

    const role =
        localStorage.getItem("userRole");


    if (role !== "worker") {

        alert(
            "Only a worker can complete a request."
        );

        return;
    }


    const card =
        button.closest(".request-card");


    const requestId =
        card.dataset.id;


    fetch(
        "/update_status/" + requestId,
        {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                status: "Completed"
            })

        }
    )

    .then(function(response) {
        return response.json();
    })

    .then(function(data) {

        if (data.success) {

            alert(
                "Service marked as completed! ✅"
            );

            window.location.reload();
        }

    })

    .catch(function(error) {

        console.error(error);

        alert(
            "Could not complete request. ❌"
        );

    });

}


// ==========================================
// RATE WORKER
// ==========================================

function rateRequest(button, rating) {

    const role =
        localStorage.getItem("userRole");


    if (role !== "customer") {

        alert(
            "Only the customer can rate the worker."
        );

        return;
    }


    const card =
        button.closest(".request-card");


    const requestId =
        card.dataset.id;


    fetch(
        "/rate_request/" + requestId,
        {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                rating: rating
            })

        }
    )

    .then(function(response) {
        return response.json();
    })

    .then(function(data) {

        if (data.success) {

            alert(
                "Thank you for rating the worker " +
                rating +
                " stars! ⭐"
            );

            window.location.reload();
        }

    })

    .catch(function(error) {

        console.error(error);

        alert(
            "Could not save rating. ❌"
        );

    });

}


// ==========================================
// WORKER REGISTRATION
// ==========================================

const workerForm =
    document.getElementById("workerForm");


if (workerForm) {

    workerForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const name =
                document.getElementById("workerName").value;

            const service =
                document.getElementById("workerService").value;

            const workerLocation =
                document.getElementById("workerLocation").value;

            const charge =
                document.getElementById("workerCharge").value;


            fetch("/register_worker", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    name: name,
                    service: service,
                    location: workerLocation,
                    charge: charge

                })

            })

            .then(function(response) {
                return response.json();
            })

            .then(function(data) {

                if (data.success) {

                    alert(
                        "Worker registered successfully! 👷✅"
                    );

                    workerForm.reset();

                    window.location.reload();
                }

            })

            .catch(function(error) {

                console.error(error);

                alert(
                    "Could not register worker. ❌"
                );

            });

        }
    );

}


// ==========================================
// CONTACT WORKER
// ==========================================

function contactWorker(workerId, workerName) {

    const role =
        localStorage.getItem("userRole");


    if (role !== "customer") {

        alert(
            "Please select Customer mode to contact a worker."
        );

        return;
    }


    const customerName =
        prompt("Enter your name:");


    if (!customerName) {

        return;
    }


    fetch("/contact_worker", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            worker_id: workerId,

            customer_name: customerName

        })

    })

    .then(function(response) {
        return response.json();
    })

    .then(function(data) {

        if (data.success) {

            alert(
                "Contact request sent to " +
                workerName +
                "! 📩"
            );

        } else {

            alert(
                "Could not send contact request. ❌"
            );

        }

    })

    .catch(function(error) {

        console.error(error);

        alert(
            "Something went wrong. ❌"
        );

    });

}


// ==========================================
// ACCEPT CONTACT REQUEST
// ==========================================

function acceptContact(contactId) {

    const role =
        localStorage.getItem("userRole");


    if (role !== "worker") {

        alert(
            "Only a worker can accept contact requests."
        );

        return;
    }


    fetch(
        "/accept_contact/" + contactId,
        {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            }

        }
    )

    .then(function(response) {
        return response.json();
    })

    .then(function(data) {

        if (data.success) {

            alert(
                "Contact request accepted! ✅"
            );

            window.location.reload();
        }

    })

    .catch(function(error) {

        console.error(error);

        alert(
            "Could not accept contact request. ❌"
        );

    });

}
