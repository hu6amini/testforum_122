  $(document).ready(function() {
    new FroalaEditor('#Post', {
      heightMin: 100,  // Adjust height as needed
      heightMax: 600,
      toolbarButtons: ['bold', 'italic', 'underline', 'insertImage', 'insertLink', 'undo', 'redo'], // Customize toolbar
      imageUpload: false // Disable image upload if needed
    });
  });
