from pathlib import Path
import shutil
root=Path(__file__).resolve().parents[2]
dest=Path(__file__).resolve().parent/'validation/same-direction-no-human'
shutil.copytree(root/'Projects/ProjectRobot2026',dest)
p=dest/'MobileRobots/PSrc/Robot.p'
s=p.read_text(encoding='utf-8')
assert 'p2 += (0, Z2()); p2 += (1, Z1()); p2 += (2, Z0());' in s
s=s.replace('p2 += (0, Z2()); p2 += (1, Z1()); p2 += (2, Z0());','p2 += (0, Z0()); p2 += (1, Z1()); p2 += (2, Z2());')
s=s.replace('      new HumanRequester((coord = coord, resource = Z1()));','      // Review probe: no human requester; no closure can occur.')
p.write_text(s,encoding='utf-8',newline='\n')
print('Probe only: both robots 0 -> 1 -> 2, no human or closure; all other behavior unchanged.')
