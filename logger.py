import time
out = file('/tmp/games.log','w')
f = file('games.log')
for line in f:
	print >>out, line
	out.flush()
	time.sleep(1)