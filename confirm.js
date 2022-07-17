async function fireAlert() {
    let firstResponse = await Swal.fire({
        title: "Are you sure you want to clear your Wordrive?",
        text: "You won't be able to undo this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    });
    if (firstResponse.isConfirmed) {
        let secondResponse = await Swal.fire(
            "Deleted!",
            "Your Wordrive has been cleared.",
            "success"
        );
        // reset popup after user response or dismissal
        if (secondResponse.isConfirmed || secondResponse.isDismissed) {
            document.location.reload();
        }
        // tell background script to clear Wordrive
        chrome.runtime.sendMessage({msg: "clear"});
    }
    // reset popup if user cancels
    else if (firstResponse.isDismissed) {
        document.location.reload();
    }
}

// fire SweetAlert popup
fireAlert();