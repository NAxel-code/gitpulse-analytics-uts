import urllib.request
import json

req = urllib.request.Request(
    'http://127.0.0.1:8000/api/v1/github/sync',
    data=json.dumps({'repo_name': 'NAxel-code/gitpulse-analytics', 'days': 14}).encode(),
    headers={'Content-Type': 'application/json'}
)
with urllib.request.urlopen(req) as resp:
    print('Sync result:', json.loads(resp.read().decode()))

# Check Overview
with urllib.request.urlopen('http://127.0.0.1:8000/api/v1/github/overview?repo=NAxel-code/gitpulse-analytics&days=14') as resp:
    overview = json.loads(resp.read().decode())
    print('=== OVERVIEW ===')
    print('Commits:', overview.get('total_commits'))
    print('Contributors:', overview.get('active_contributors'))
    print('PRs:', overview.get('total_prs'))
    print('PR Merge Rate:', overview.get('pr_merge_rate'))
    print('Open Issues:', overview.get('open_issues'))
    print('Stars:', overview.get('total_stars'))

# Check Contributors
with urllib.request.urlopen('http://127.0.0.1:8000/api/v1/github/contributors?repo=NAxel-code/gitpulse-analytics&days=14') as resp:
    contribs = json.loads(resp.read().decode())
    print('=== CONTRIBUTORS ===')
    for c in contribs:
        print(f" - {c.get('login')}: {c.get('commits')} commits, {c.get('prs_merged')} merged PRs, velocity score: {c.get('velocity_score')}")

# Check PR Funnel
with urllib.request.urlopen('http://127.0.0.1:8000/api/v1/github/pr-funnel?repo=NAxel-code/gitpulse-analytics&days=14') as resp:
    funnel = json.loads(resp.read().decode())
    print('=== FUNNEL ===')
    for stage in funnel:
        print(f" - {stage.get('stage_name')}: {stage.get('count')}")
