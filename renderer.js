// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
let udp = require('dgram');

let vita_discovery_port = 4992;
// let vita_meter_port		= 4991;

let discoveryListener = udp.createSocket('udp4');
// let meterListener = udb.createSocket('udp4');

let logarea = document.getElementById('logtext')


const vita_discovery_stream = 0x00000800;
const vita_flex_oui = 0x00001c2d;
const vita_flex_information_class = 0x534cffff;

const PacketType = {
	if_data			: 0x00,
	if_data_stream	: 0x01,
	ext_data		: 0x02,
	ext_data_stream	: 0x03,
	if_context		: 0x04,
	ext_context		: 0x05
};

const TSIType = {
	none   : 0x00,
    utc    : 0x01,
    gps    : 0x02,
    other  : 0x03
}

const TSFType = {
	none         : 0x00,
    sampleCount  : 0x01,
    realtime     : 0x02,
    freeRunning  : 0x03
}

function parse_vita_packet(msg) {
	if (msg.length < 7) {
		return undefined;
	}

	let data = new DataView(msg.buffer);
	let vita = {};
	vita.message_bytes = msg.length;

	let packet_flags_high = data.getUint8(0, false);
	vita.packet_type = packet_flags_high >> 4 & 0x0F;
	vita.has_class = packet_flags_high & 0x08;
	vita.has_trailer = packet_flags_high & 0x04;

	let packet_flags_low = data.getUint8(1, false);
	vita.tsi_type = packet_flags_low >> 6 & 0x03;
	vita.tsf_type = packet_flags_low >> 4 & 0x03;
	vita.packet_count = packet_flags_low & 0x0F;

	vita.packet_size = data.getUint16(2, false) * 4;

	let header_byte = 4;
	if (vita.packet_type == PacketType.if_data_stream || vita.packet_type == PacketType.ext_data_stream) {
		vita.stream_id = data.getUint32(header_byte, false);
		header_byte += 4;
	}

	if (vita.has_class) {
		vita.oui = data.getUint32(header_byte, false);
		header_byte +=4;

		vita.class_id = data.getUint32(header_byte, false);
		header_byte +=4;
	}

	if (vita.tsi_type != TSIType.none) {
		vita.timestamp_int = data.getUint32(header_byte, false);
		header_byte += 4;
	}

	if (vita.tsf_type != TSIType.none) {
		vita.timestamp_int = data.getBigInt64(header_byte, false);
		header_byte += 8;
	}

	vita.payload = msg.slice(header_byte)

	// TODO: Vita Trailier...
	return vita;
}

//emits after the socket is closed using socket.close();
discoveryListener.on('close', function(){
	logarea.value += 'Socket closed.\n';
	console.log('Socket is closed !');
});

//emits after the socket is closed using socket.close();
discoveryListener.on('connect', function(){
	logarea.value += 'Socket connected.\n';
	console.log('Socket is connected !');
});
  
// emits when any error occurs
discoveryListener.on('error', function(error){
  logarea.value += 'Socket error: ' + error + '\n';
  console.log('Error: ' + error);
  discoveryListener.close();
});

//emits when socket is ready and listening for datagram msgs
discoveryListener.on('listening', function() {
	var address = discoveryListener.address();
	var port = address.port;
	var family = address.family;
	var ipaddr = address.address;
	logarea.value += 'Socket listening: ' + ipaddr + ':' + port + '\n';
	console.log('Server is listening at port' + port);
	console.log('Server ip :' + ipaddr);
	console.log('Server is IP4/IP6 : ' + family);
});

// emits on new datagram msg
discoveryListener.on('message', function(msg, info) {
	endl = msg.toString().endsWith('\n') ? '' : '\n' 
	logarea.value += 'Received: ' + msg.toString() + endl;

	console.log('Data received from client : ' + msg.toString());
	console.log('Received %d bytes from %s:%d\n',msg.length, info.address, info.port);
	console.log('data:');
	// console.log(msg);

	vita_packet = parse_vita_packet(msg);
	showVita(vita_packet);
});
  

function showVita(vita) {
	let stream_id = document.getElementById('stream_id');
	stream_id.value = '0x' + vita.stream_id.toString(16);

	let oui = document.getElementById('oui');
	oui.value = '0x' + vita.oui.toString(16);

	let class_id = document.getElementById('class');
	class_id.value = '0x' + vita.class_id.toString(16);

}

discoveryListener.bind(vita_discovery_port);
// meterListener.bind(vita_meter_port);
