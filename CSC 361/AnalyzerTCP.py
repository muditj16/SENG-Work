import sys
import struct


class GlobalHeader:
    version_major = None
    magic_number = None
    version_minor = None
    thiszone = None
    sigfigs = None
    network= None
    snaplen= None

    def __init__(self, buffer):
        self.magic_number, self.version_minor, self.version_major, self.sigfigs, self.thiszone, self.snaplen, self.network = struct.unpack('IHHiIII', buffer)




class PacketHeader:         #attributes for packetheader
    ts_sec = None
    ts_usec = None
    incl_len = None
    orig_len = None
    def __init__(self):
        self.ts_sec = 0
        self.ts_usec = 0
        self.incl_len = 0
        self.orig_len = 0

    def set_header(self, buffer):
        self.ts_sec, self.ts_usec, self.incl_len, self.orig_len = struct.unpack('IIII', buffer)







class TCPHeader:

    src_port = 0
    dst_port = 0
    seq_num = 0
    ack_num = 0
    data_offset = 0
    flags = None
    window_size =0
    checksum = 0
    ugp = 0
        #extract various fields from TCP header
    def __init__(self):
            self.src_port = 0
            self.dst_port = 0
            self.seq_num = 0
            self.ack_num = 0
            self.data_offset = 0
            self.flags = {}
            self.window_size =0
            self.checksum = 0
            self.ugp = 0


    def get_src_port(self, buffer):
        num1 = ((buffer[0] & 240) >> 4) * 16 * 16 * 16
        num2 = (buffer[0] & 15) * 16 * 16
        num3 = ((buffer[1] & 240) >> 4) * 16
        num4 = (buffer[1] & 15)
        self.src_port = num1 + num2 + num3 + num4

    # set destination port
    def get_dst_port(self, buffer):
        num1 = ((buffer[0] & 240) >> 4) * 16 * 16 * 16
        num2 = (buffer[0] & 15) * 16 * 16
        num3 = ((buffer[1] & 240) >> 4) * 16
        num4 = (buffer[1] & 15)
        self.dst_port = num1 + num2 + num3 + num4
    # Method to get sequence number
    def get_seq_num(self, buffer):
        self.seq_num = struct.unpack(">I", buffer)[0]

    def get_ack_num(self, buffer):
        self.ack_num = struct.unpack(">I", buffer)[0]



    def get_flags(self,buffer):
        value = struct.unpack("B", buffer)[0]
        self.flags["FIN"] = value & 1
        self.flags["SYN"] = (value & 2) >> 1
        self.flags["RST"] = (value & 4) >> 2
        self.flags["ACK"] = (value & 16) >> 4

    def get_window_size(self, buffer1, buffer2):
        buffer = buffer1+buffer2
        self.window_size = struct.unpack('H', buffer)[0]

# set window size
# buffer1 + buffer2 is the 2-byte window size field in TCP header

    def get_data_offset(self,buffer):
        l = struct.unpack("B", buffer)[0]
        self.data_offset = ((l & 240) >> 4)*4
# get the length of the header
# buffer is the 4-bit data offset field

    def relative_seq_num(self,orig_num):
        if(self.seq_num >= orig_num):
            self.seq_num -= orig_num

# calculate the relative seq_num
# orig_num is the first packet in the trace

    def relative_ack_num(self,orig_num):
        if(self.ack_num >= orig_num):
            self.ack_num = self.ack_num - orig_num + 1


class IPHeader:
    src_ip = None
    dst_ip = None
    ip_header_len = None
    total_len = None

    def __init__(self):
        self.src_ip = None
        self.dst_ip = None
        self.ip_header_len = 0
        self.total_len = 0


    def header_len_set(self,length):
        res = struct.unpack('B', length)[0]
        self.ip_header_len = (res & 15)*4


    def total_len_set(self, length):
        self.total_len = struct.unpack('>H', length)[0]

    def set_IP(self,buffer1,buffer2):
        src_addr = struct.unpack('BBBB',buffer1)
        dst_addr = struct.unpack('BBBB',buffer2)
        self.src_ip = f"{src_addr[0]}.{src_addr[1]}.{src_addr[2]}.{src_addr[3]}"
        self.dst_ip = f"{dst_addr[0]}.{dst_addr[1]}.{dst_addr[2]}.{dst_addr[3]}"



class packet():

    header= None
    tcp = None
    ip = None
    data = None
    timestamp = None
    payload = None

    def __init__(self):
        self.header = PacketHeader()
        self.tcp = TCPHeader()
        self.ip = IPHeader()
        self.data= b''
        self.timestamp = 0
        self.payload =0
    def timestamp_set(self,orig_time):
        secs = self.header.ts_sec
        microsecs = self.header.ts_usec
        self.timestamp= round(secs+microsecs * 0.000001-orig_time, 6)

#buffer1: the bytes object for ts_sec
#buffer2: the bytes object for ts_usec
#orig_time: the start time of the first packet

    def set_header(self, buffer):
        self.header.set_header(buffer)

    def set_data(self, buffer):
        self.data = buffer

    def set_number(self, value):
        self.packet_number = value

    def set_rtt(self, p):
        rtt = p.timestamp - self.timestamp  # Calculate RTT
        self.RTT_value = round(rtt, 8)

    def set_ip(self):
        self.ip.header_len_set(self.data[14:15])
        self.ip.total_len_set(self.data[16:18])
        self.ip.set_IP(self.data[26:30], self.data[30:34])

    def set_tcp(self):
        offset = 14 + self.ip.ip_header_len
        self.tcp.get_src_port(self.data[offset + 0:offset + 2])

        self.tcp.get_dst_port(self.data[offset + 2:offset + 4])  # destination port
        self.tcp.get_seq_num(self.data[offset + 4:offset + 8])   #  sequence number
        self.tcp.get_ack_num(self.data[offset + 8:offset + 12])  #  acknowledgment number
        self.tcp.get_data_offset(self.data[offset + 12:offset + 13])  # data offset
        self.tcp.get_flags(self.data[offset + 13:offset + 14])      #TCP flags
        self.tcp.get_window_size(self.data[offset + 14:offset+15], self.data[offset+15: offset+16])

    def set_payload(self, payload):
        self.payload = payload


#main execution

if len(sys.argv) != 2:
    print("Invalid input, Usage: python 3 AnalyzerTCP.py <example_file_cap>")
    exit()

input = sys.argv[1]
f=  open(input, 'rb')       #open file

global_header = GlobalHeader(f.read(24))

if global_header.magic_number != 0xa1b2c3d4:    #check magic no.
    exit("magic number does not match")
dic = {}        #to store connections
start_time_pcap = None      #start time

while True:         #read packets
    s = f.read(16)
    if s == b'':        #end of file
        break
    pkt = packet()
    pkt.set_header(s)

    incl_len = pkt.header.incl_len      #get length

    if start_time_pcap is None:     #record start time
        secs = pkt.header.ts_sec
        microsecs = pkt.header.ts_usec
        start_time_pcap = round(secs+ microsecs * 0.000001, 6)

    pkt.set_data(f.read(incl_len))
    pkt.set_ip()
    pkt.set_tcp()

    #calculate payload and padding
    payload = pkt.header.incl_len -14 -pkt.ip.ip_header_len -20
    padding = pkt.header.incl_len - pkt.ip.total_len-14

    if payload < 42:        #threshold
        payload = 0

    pkt.set_payload(payload+padding)
    connection = frozenset([pkt.ip.src_ip, pkt.ip.dst_ip, pkt.tcp.src_port, pkt.tcp.dst_port])

    if connection not in dic:
        dic[connection] = []        #new list
    number = len(dic[connection]) + 1
    pkt.set_number(number)

    dic[connection].append(pkt)

tcp_total = len(dic)        #unique connections

print('A) Total number of connections:', tcp_total)
print('____________________________________________________\n')
print()
print('B) Connections\' details:\n')

tcp_window_size =[]
tcp_reset =0
tcp_complete= []
tcp_packets = []
j=1         #counter for connections
rtt= []

    #analyze each connection
for conn in dic:
    first = None
    last = None
    syn_count = 0
    rst_count= 0
    fin_count = 0
    dst_conn = []
    src_conn = []
    print('Connection %d:' % j)

    for o in range(len(dic[conn])):
        pkt = dic[conn][o]
        if pkt.tcp.flags['SYN'] == 1:
            if first is None:
                first = pkt

            syn_count += 1
        if pkt.tcp.flags['FIN'] == 1:
            fin_count += 1

            last = pkt

        if pkt.tcp.flags['RST'] == 1:
            rst_count += 1
        pkt.timestamp_set(start_time_pcap)


        if pkt.ip.src_ip == first.ip.src_ip:
            src_conn.append(pkt)
        else:
            dst_conn.append(pkt)


    print('Source Address:', first.ip.src_ip)
    print('Destination Address:', first.ip.dst_ip)
    print('Source Port:', first.tcp.src_port)
    print('Destination Port:', first.tcp.dst_port)
    print('Status: S%dF%d' % (syn_count, fin_count) )

    if rst_count != 0:
        tcp_reset+=1
    if last is not None:
        first.timestamp_set(start_time_pcap)
        last.timestamp_set(start_time_pcap)
        d = last.timestamp - first.timestamp

        print('Start time:', first.timestamp, 'seconds')
        print('End time:', last.timestamp, 'seconds')
        print('Duration:', round(d,6), 'seconds')

        tcp_complete.append(d)
        print('Number of packets sent from Source to Destination:', len(src_conn))
        print('Number of packets sent from Destination to Source:', len(dst_conn))
        print('Total number of packets:', (len(src_conn)+len(dst_conn)) )

        tcp_packets.append(len(src_conn)+len(dst_conn))
        src_bytes = 0
        dst_bytes=0

        for m in range(len(src_conn)):
            src_bytes+= src_conn[m].payload

        for m in range(len(dst_conn)):
            dst_bytes += dst_conn[m].payload

        print('Number of data bytes sent from Source to Destination:', src_bytes, 'bytes')
        print('Number of data bytes sent from Destination to Source:', dst_bytes, 'bytes')
        print('Total number of data bytes:', (src_bytes + dst_bytes), 'bytes')


        for n in range(len(dic[conn])):
            tcp_window_size.append(dic[conn][n].tcp.window_size)

        for a1 in src_conn:
            for a2 in dst_conn:
                if a1.tcp.seq_num + a1.tcp.flags['SYN'] == a2.tcp.ack_num and a1.timestamp < a2.timestamp:
                    rtt.append(a2.timestamp - a1.timestamp)
                    break

                if a1.tcp.seq_num + a1.tcp.flags['FIN'] == a2.tcp.ack_num and a1.timestamp < a2.timestamp:
                    rtt.append(a2.timestamp - a1.timestamp)
                    break

                if a1.tcp.seq_num + a1.payload == a2.tcp.ack_num and a1.timestamp < a2.timestamp:
                    rtt.append(a2.timestamp - a1.timestamp)
                    break


    print('END')
    print('+++++++++++++++++++++++++++++++++++++++++++')
    print('.')
    print('.')
    print('.')
    print('+++++++++++++++++++++++++++++++++++++++++++')


    j+=1


print('______________________________________\n')

print('C) General:\n')

print('Total number of complete TCP connections:', len(tcp_complete))
print('Number of reset TCP connections:', tcp_reset)
print('Number of TCP connections that were still open when the trace capture ended:', tcp_total - len(tcp_complete))

print('______________________________________\n')

print('D) Complete TCP connections:\n')

print('Minimum time duration:', round(min(tcp_complete), 6), 'seconds')
print('Mean time duration:', round(sum(tcp_complete) / len(tcp_complete), 6), 'seconds')
print('Maximum time duration:', round(max(tcp_complete), 6), 'seconds')

print()

print('Minimum RTT value:', round(min(rtt),6), 'seconds')
print('Mean RTT value:', round(sum(rtt)/len(rtt),6), 'seconds')
print('Maximum RTT value:', round(max(rtt),6), 'seconds')

print()

print('Minimum number of packets including both send/received:', round(min(tcp_packets), 6))
print('Mean number of packets including both send/received:', round(sum(tcp_packets) / len(tcp_packets), 6))
print('Maximum number of packets including both send/received:', round(max(tcp_packets), 6))

print()

print('Minimum number of window size including both send/received:', round(min(tcp_window_size), 6))
print('Mean number of window size including both send/received:', round(sum(tcp_window_size) / len(tcp_window_size), 6))
print('Maximum number of window size including both send/received:', round(max(tcp_window_size), 6))

print('______________________________________\n')
