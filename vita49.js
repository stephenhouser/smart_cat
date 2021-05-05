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

function vita49_decode(msg) {
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
