var Spider = require('./built')
var domain = require('domain')
var argv = process.argv
var server,port
var host_index = argv.indexOf('-h'), port_index = argv.indexOf('-p');

if(host_index > -1){
  server = argv[host_index + 1]
}else {
  server = '127.0.0.1'
}
if(port_index > -1){
  port = argv[port_index + 1]
}else {
  port = '3000'
}

var client = new Spider["default"]({
  server,
  port
})

var d = domain.create();
d.on('error', function(er) {
  console.error('Caught error!', er.toString());
});
d.run(function() {
  client.run()
});

