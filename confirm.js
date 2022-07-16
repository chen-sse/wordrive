// fire SweetAlert popup
Swal.fire({
    title: "Are you sure you want to clear your Wordrive?",
    text: "You won't be able to undo this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!"
}).then((result) => {
    // if user confirms deletion
    if (result.isConfirmed) {
        Swal.fire(
            "Deleted!",
            "Your Wordrive has been cleared.",
            "success"
        );
        // tell background script to clear Wordrive
        chrome.runtime.sendMessage({msg: "clear"});
    }
});