async function fireAlert() {
    let response = await Swal.fire({
        title: "Are you sure you want to clear your Wordrive?",
        text: "You won't be able to undo this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    });
    if (response.isConfirmed) {
        Swal.fire(
            "Deleted!",
            "Your Wordrive has been cleared.",
            "success"
        );
        // tell background script to clear Wordrive
        chrome.runtime.sendMessage({msg: "clear"});
    }
}

// fire SweetAlert popup
fireAlert();