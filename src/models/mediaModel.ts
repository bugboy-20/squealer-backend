import * as filePluginLib from "mongoose-file"

var filePlugin = filePluginLib.filePlugin;
var make_upload_to_model = filePluginLib.make_upload_to_model;

var uploads_base = path.join(__dirname, "uploads");
var uploads = path.join(uploads_base, "u");
 
var SampleSchema = new Schema({
});

SampleSchema.plugin(filePlugin, {
    name: "photo",
    upload_to: make_upload_to_model(uploads, 'photos'),
    relative_to: uploads_base
});
var SampleModel = db.model("SampleModel", SampleSchema);
