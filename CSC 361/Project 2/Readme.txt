Mudit Jaswal
V00982906
CSC 361 Programming Assignment 2

What does AnalyzerTCP.py do?
AnalyzerTCP.py is a Python script that analyzes TCP connections from a packet capture (.cap) file. It parses the global and packet headers, extracts TCP and IP information, and identifies unique TCP connections. For each connection, it calculates statistics such as duration, number of packets, data bytes sent/received, and round-trip times (RTT). The script prints a summary of all connections, including complete, reset, and open connections, and provides detailed metrics for each.



Instructions for Running and Building the files:

1. To run the code, simply execute python3 AnalyzerTCP.py <sample_file.cap> from the terminal.


Project Overview:
This project features `AnalyzerTCP.py`, a Python script for analyzing TCP packet capture files. It reads and parses .cap files, extracts packet headers, and provides insights into network traffic for learning about TCP/IP protocols.

