var socket = io.connect('/');
var changes = document.querySelector('#changes');

socket.on('message', function(data) {
  console.log('Message received: ' + data);
  socket.emit('message received', 'boom! I got your message');
});

socket.on('headlines', function(data) {
  console.log(`File changed: ${data}`);
  var date = new Date();
  var parent_li = document.createElement('li');
  parent_li.innerText = 'Latest Headlines as of ' + date.getHours() + ":" + zeroPad(date.getMinutes(),2);
  var nested_ul = document.createElement('ul');
  nested_ul.innerHTML += data;
  parent_li.append(nested_ul);
  changes.append(parent_li);
});

function zeroPad(val,length) {
  val = val.toString();
  while (val.length < length) {
    val = "0" + val;
  }
  return val;
}
