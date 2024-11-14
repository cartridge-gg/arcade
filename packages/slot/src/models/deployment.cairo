// Intenral imports

use arcade_slot::models::index::Deployment;
use arcade_slot::types::status::Status;
use arcade_slot::types::tier::Tier;

// Errors

pub mod errors {
    pub const DEPLOYMENT_ALREADY_EXISTS: felt252 = 'Deployment: already exists';
    pub const DEPLOYMENT_NOT_EXIST: felt252 = 'Deployment: does not exist';
    pub const DEPLOYMENT_INVALID_IDENTIFIER: felt252 = 'Deployment: invalid identifier';
    pub const DEPLOYMENT_INVALID_PROJECT: felt252 = 'Deployment: invalid project';
    pub const DEPLOYMENT_INVALID_STATUS: felt252 = 'Deployment: invalid status';
    pub const DEPLOYMENT_INVALID_SERVICE_ID: felt252 = 'Deployment: invalid service id';
    pub const DEPLOYMENT_INVALID_TIER: felt252 = 'Deployment: invalid tier';
    pub const DEPLOYMENT_INVALID_REGIONS: felt252 = 'Deployment: invalid regions';
}

#[generate_trait]
impl DeploymentImpl of DeploymentTrait {
    #[inline]
    fn new(
        id: felt252,
        project: felt252,
        status: Status,
        branch: Option<felt252>,
        service_id: felt252,
        tier: Tier,
        regions: felt252,
        auto_upgrade: bool,
        config: ByteArray,
    ) -> Deployment {
        // [Check] Inputs
        DeploymentAssert::assert_valid_identifier(id);
        DeploymentAssert::assert_valid_project(project);
        DeploymentAssert::assert_valid_status(status);
        DeploymentAssert::assert_valid_service_id(service_id);
        DeploymentAssert::assert_valid_tier(tier);
        DeploymentAssert::assert_valid_regions(regions);
        // [Return] Deployment
        let time = starknet::get_block_timestamp();
        Deployment {
            id: id,
            project: project,
            status: status.into(),
            branch: branch,
            service_id: service_id,
            tier: tier.into(),
            regions: regions,
            auto_upgrade: auto_upgrade,
            config: config,
            created_at: time,
            updated_at: time,
            spin_down_at: Option::None,
            spin_up_at: Option::None,
        }
    }
}

#[generate_trait]
impl DeploymentAssert of AssertTrait {
    #[inline]
    fn assert_does_not_exist(self: Deployment) {
        assert(self.project == 0, errors::DEPLOYMENT_ALREADY_EXISTS);
    }

    #[inline]
    fn assert_does_exist(self: Deployment) {
        assert(self.project != 0, errors::DEPLOYMENT_NOT_EXIST);
    }

    #[inline]
    fn assert_valid_identifier(identifier: felt252) {
        assert(identifier != 0, errors::DEPLOYMENT_INVALID_IDENTIFIER);
    }

    #[inline]
    fn assert_valid_project(project: felt252) {
        assert(project != 0, errors::DEPLOYMENT_INVALID_PROJECT);
    }

    #[inline]
    fn assert_valid_status(status: Status) {
        assert(status != Status::None, errors::DEPLOYMENT_INVALID_STATUS);
    }

    #[inline]
    fn assert_valid_service_id(service_id: felt252) {
        assert(service_id != 0, errors::DEPLOYMENT_INVALID_SERVICE_ID);
    }

    #[inline]
    fn assert_valid_tier(tier: Tier) {
        assert(tier != Tier::None, errors::DEPLOYMENT_INVALID_TIER);
    }

    #[inline]
    fn assert_valid_regions(regions: felt252) {
        assert(regions != 0, errors::DEPLOYMENT_INVALID_REGIONS);
    }
}

#[cfg(test)]
mod tests {
    // Local imports

    use super::{Deployment, DeploymentTrait, DeploymentAssert, Status, Tier};

    // Constants

    const IDENTIFIER: felt252 = 'ID';
    const PROJECT: felt252 = 'PROJECT';
    const STATUS: Status = Status::Active;
    const BRANCH: Option<felt252> = Option::None;
    const SERVICE_ID: felt252 = 'SERVICE_ID';
    const TIER: Tier = Tier::Basic;
    const REGIONS: felt252 = 'REGIONS';
    const AUTO_UPGRADE: bool = true;

    #[test]
    fn test_deployment_new() {
        let deployment = DeploymentTrait::new(
            IDENTIFIER, PROJECT, STATUS, BRANCH, SERVICE_ID, TIER, REGIONS, AUTO_UPGRADE, ""
        );
        assert_eq!(deployment.id, IDENTIFIER);
        assert_eq!(deployment.project, PROJECT);
        assert_eq!(deployment.status, STATUS.into());
        assert_eq!(deployment.branch, BRANCH);
        assert_eq!(deployment.service_id, SERVICE_ID);
        assert_eq!(deployment.tier, TIER.into());
        assert_eq!(deployment.regions, REGIONS);
        assert_eq!(deployment.auto_upgrade, AUTO_UPGRADE);
        assert_eq!(deployment.config, "");
        assert_eq!(deployment.created_at, starknet::get_block_timestamp());
        assert_eq!(deployment.updated_at, starknet::get_block_timestamp());
        assert_eq!(deployment.spin_down_at, Option::None);
        assert_eq!(deployment.spin_up_at, Option::None);
    }

    #[test]
    fn test_deployment_assert_does_exist() {
        let deployment = DeploymentTrait::new(
            IDENTIFIER, PROJECT, STATUS, BRANCH, SERVICE_ID, TIER, REGIONS, AUTO_UPGRADE, ""
        );
        deployment.assert_does_exist();
    }

    #[test]
    #[should_panic(expected: 'Deployment: already exists')]
    fn test_deployment_revert_already_exists() {
        let deployment = DeploymentTrait::new(
            IDENTIFIER, PROJECT, STATUS, BRANCH, SERVICE_ID, TIER, REGIONS, AUTO_UPGRADE, ""
        );
        deployment.assert_does_not_exist();
    }
}
