'use strict';
/**
 * F-03 fictional, DENY-BY-DEFAULT access-policy rehearsal.
 * Fixture verification and consent booleans are never security credentials.
 * Do not import this policy into a production client as authorization.
 */
const ACTOR_ROLES=Object.freeze(['member','group-leader','team-leader','church-admin']);
const RESOURCE_ACTIONS=Object.freeze({
  group_thread:['read','write','react'],
  team_thread:['read','write','react'],
  attendance:['read','manage'],
  serving_shift:['read','respond','manage'],
  prayer_request:['read','write'],
  care_task:['read','manage'],
  direct_thread:[]
});
const ACCESS_POLICY_VERSION=1;
const key=x=>typeof x==='string'&&/^[A-Za-z0-9][A-Za-z0-9:_-]{0,127}$/.test(x);
const clone=x=>structuredClone(x);
function requireFixture(ok,message){if(!ok)throw new TypeError('Mock access policy v1: '+message);}
function validMember(m,kind){
  requireFixture(m&&key(m.userId)&&key(m.organizationId)&&key(m.scopeId),
    kind+' membership requires user, organization and scope IDs');
  requireFixture(m.status==='active'||m.status==='revoked',kind+' membership status must be active or revoked');
}
function createMockAccessPolicy({
  actors=[],groupMemberships=[],teamMemberships=[],careGrants=[]
}={}){
  const users=new Map();
  for(const row of actors){
    requireFixture(row&&key(row.id)&&key(row.organizationId)&&ACTOR_ROLES.includes(row.role)&&
      typeof row.fixtureVerified==='boolean','invalid fictional actor');
    requireFixture(!users.has(row.id),'duplicate actor ID');
    users.set(row.id,clone(row));
  }
  const groups=new Map(),teams=new Map(),grants=new Set();
  for(const [rows,map,type] of [[groupMemberships,groups,'group'],[teamMemberships,teams,'team']]){
    for(const m of rows){
      validMember(m,type);
      const actor=users.get(m.userId);
      requireFixture(!!actor&&actor.organizationId===m.organizationId,type+' membership references missing/cross-org actor');
      const k=m.organizationId+'|'+m.scopeId+'|'+m.userId;
      requireFixture(!map.has(k),'duplicate '+type+' membership');
      map.set(k,clone(m));
    }
  }
  for(const grant of careGrants){
    requireFixture(grant&&key(grant.userId)&&key(grant.organizationId)&&key(grant.careTaskId)&&key(grant.groupId),
      'invalid explicit care grant');
    const u=users.get(grant.userId);
    requireFixture(!!u&&u.organizationId===grant.organizationId,'care grant references missing/cross-org user');
    grants.add(grant.organizationId+'|'+grant.groupId+'|'+grant.careTaskId+'|'+grant.userId);
  }
  function evaluate({actorId,resource,action}={}){
    const deny=reason=>Object.freeze({allowed:false,reason});
    if(!key(actorId)||!resource||typeof resource!=='object'||Array.isArray(resource)||!key(resource.id)||
      !key(resource.organizationId)||typeof action!=='string')return deny('invalid-request');
    const actor=users.get(actorId);
    if(!actor||!actor.fixtureVerified)return deny('unverified-fixture-identity');
    if(actor.organizationId!==resource.organizationId)return deny('organization-boundary');
    if(!Object.hasOwn(RESOURCE_ACTIONS,resource.kind)||!RESOURCE_ACTIONS[resource.kind].includes(action))
      return deny('action-not-supported');
    // Without an approved minors and direct-message policy, these are hard denied.
    if(resource.minorRelated===true)return deny('minor-safeguards-not-approved');
    if(resource.kind==='direct_thread')return deny('direct-messaging-not-authorized');
    const groupMember=key(resource.groupId)&&groups.get(resource.organizationId+'|'+resource.groupId+'|'+actorId);
    const teamMember=key(resource.teamId)&&teams.get(resource.organizationId+'|'+resource.teamId+'|'+actorId);
    const activeGroup=groupMember?.status==='active',activeTeam=teamMember?.status==='active';
    const groupLeader=activeGroup&&['group-leader','church-admin'].includes(actor.role);
    const teamLeader=activeTeam&&['team-leader','church-admin'].includes(actor.role);
    switch(resource.kind){
      case 'group_thread':
        return activeGroup?{allowed:true,reason:'active-group-membership'}:deny('group-membership-required');
      case 'team_thread':
        return activeTeam?{allowed:true,reason:'active-team-membership'}:deny('team-membership-required');
      case 'attendance':
        return groupLeader?{allowed:true,reason:'scoped-group-leader'}:deny('scoped-group-leadership-required');
      case 'serving_shift':
        if(!activeTeam)return deny('team-membership-required');
        return (action!=='manage'||teamLeader)?{allowed:true,reason:'scoped-serving-access'}:deny('scoped-team-leadership-required');
      case 'prayer_request':
        if(!activeGroup)return deny('group-membership-required');
        if(resource.consentGranted!==true||resource.audience!=='group')return deny('explicit-group-sharing-consent-required');
        return {allowed:true,reason:'explicit-group-sharing-consent'};
      case 'care_task':
        if(!groupLeader)return deny('scoped-group-leadership-required');
        if(resource.consentGranted!==true)return deny('care-subject-consent-required');
        if(!grants.has(resource.organizationId+'|'+resource.groupId+'|'+resource.id+'|'+actorId))
          return deny('explicit-care-assignment-required');
        return {allowed:true,reason:'scoped-care-grant'};
      default:return deny('action-not-supported');
    }
  }
  function requireAccess(request){
    const decision=evaluate(request);
    if(!decision.allowed)throw new Error('Mock access denied: '+decision.reason);
    return decision;
  }
  return Object.freeze({policyVersion:ACCESS_POLICY_VERSION,evaluate,requireAccess});
}
module.exports={ACCESS_POLICY_VERSION,ACTOR_ROLES,RESOURCE_ACTIONS,createMockAccessPolicy};
