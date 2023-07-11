FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileEncode,
)

FilePond.setOptions({
    styePanelAspectRatio:150/100,
    imageResizeTargetWidth :100,
    imageResizeTargetHeight:150
})

FilePond.parse(document.body)