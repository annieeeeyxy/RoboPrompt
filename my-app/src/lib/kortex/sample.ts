import type { KortexFile } from "./types";

/**
 * Mock demonstration used for tests and the "Load sample" button. Same
 * schema as a real Kortex export (structure copied from an observed file),
 * but with made-up coordinates — no real workspace data is embedded here.
 */
export const SAMPLE_KORTEX_FILE: KortexFile = {
  sequences: {
    sequence: [
      {
        applicationData: '{"kinova":{"color":0}}',
        handle: { identifier: 20000, permission: 7 },
        name: "sample_pick_place_demo",
        tasks: [
          {
            applicationData: '{"kinova":{}}',
            action: {
              applicationData: '{"kinova":{"color":0}}',
              handle: { identifier: 20060, permission: 7, actionType: 33 },
              sendGripperCommand: {
                mode: 3,
                gripper: { finger: [{ value: 0.01, fingerIdentifier: 1 }] },
                duration: 0,
              },
              name: "OPEN",
            },
            groupIdentifier: 0,
          },
          {
            applicationData: '{"kinova":{}}',
            action: {
              reachPose: {
                targetPose: { x: 0.42, y: -0.11, z: 0.22, thetaX: 178.2, thetaY: -2.1, thetaZ: 88.4 },
                constraint: { speed: { translation: 0.25, orientation: 0 } },
              },
              applicationData: '{"kinova":{"color":0}}',
              handle: { identifier: 20061, permission: 7, actionType: 6 },
              name: "APPROACH_A",
            },
            groupIdentifier: 1,
          },
          {
            applicationData: '{"kinova":{}}',
            action: {
              reachPose: {
                targetPose: { x: 0.42, y: -0.11, z: 0.031, thetaX: 178.3, thetaY: -2.0, thetaZ: 88.5 },
                constraint: { speed: { translation: 0.25, orientation: 0 } },
              },
              applicationData: '{"kinova":{"color":0}}',
              handle: { identifier: 20062, permission: 7, actionType: 6 },
              name: "PICK_LOW",
            },
            groupIdentifier: 2,
          },
          {
            applicationData: '{"kinova":{}}',
            action: {
              applicationData: '{"kinova":{"color":0}}',
              handle: { identifier: 20063, permission: 7, actionType: 33 },
              sendGripperCommand: {
                mode: 3,
                gripper: { finger: [{ value: 0.55, fingerIdentifier: 1 }] },
                duration: 0,
              },
              name: "CLOSE",
            },
            groupIdentifier: 3,
          },
          {
            applicationData: '{"kinova":{}}',
            action: {
              reachPose: {
                targetPose: { x: 0.55, y: 0.2, z: 0.24, thetaX: 178.1, thetaY: -2.3, thetaZ: 88.3 },
                constraint: { speed: { translation: 0.25, orientation: 0 } },
              },
              applicationData: '{"kinova":{"color":0}}',
              handle: { identifier: 20064, permission: 7, actionType: 6 },
              name: "TRAVEL_B",
            },
            groupIdentifier: 4,
          },
          {
            applicationData: '{"kinova":{}}',
            action: {
              reachPose: {
                targetPose: { x: 0.55, y: 0.2, z: 0.029, thetaX: 178.2, thetaY: -2.2, thetaZ: 88.6 },
                constraint: { speed: { translation: 0.25, orientation: 0 } },
              },
              applicationData: '{"kinova":{"color":0}}',
              handle: { identifier: 20065, permission: 7, actionType: 6 },
              name: "PLACE_LOW",
            },
            groupIdentifier: 5,
          },
          {
            applicationData: '{"kinova":{}}',
            action: {
              applicationData: '{"kinova":{"color":0}}',
              handle: { identifier: 20066, permission: 7, actionType: 33 },
              sendGripperCommand: {
                mode: 3,
                gripper: { finger: [{ value: 0.01, fingerIdentifier: 1 }] },
                duration: 0,
              },
              name: "RELEASE",
            },
            groupIdentifier: 6,
          },
          {
            applicationData: '{"kinova":{}}',
            action: {
              reachPose: {
                targetPose: { x: 0.55, y: 0.2, z: 0.2, thetaX: 178.2, thetaY: -2.2, thetaZ: 88.4 },
                constraint: { speed: { translation: 0.25, orientation: 0 } },
              },
              applicationData: '{"kinova":{"color":0}}',
              handle: { identifier: 20067, permission: 7, actionType: 6 },
              name: "END",
            },
            groupIdentifier: 7,
          },
        ],
      },
    ],
  },
};
