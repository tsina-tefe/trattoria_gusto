<?php

namespace App\Http\Controllers;

use App\Models\EvaluationResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class SyncController extends Controller
{
    /**
     * Sync evaluation responses from offline storage
     */
    public function syncEvaluation(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:create,update',
            'data' => 'required|array',
            'timestamp' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $type = $request->input('type');
        $data = $request->input('data');
        $timestamp = $request->input('timestamp');

        try {
            DB::beginTransaction();

            $result = match($type) {
                'create' => $this->createEvaluationResponse($data, $timestamp),
                'update' => $this->updateEvaluationResponse($data, $timestamp),
            };

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Sync evaluation failed', [
                'type' => $type,
                'data' => $data,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create evaluation response from offline data
     */
    private function createEvaluationResponse(array $data, int $timestamp): array
    {
        // Check if already exists
        $existing = EvaluationResponse::where('evaluation_id', $data['evaluation_id'])
            ->where('evaluator_id', auth()->id())
            ->first();

        if ($existing) {
            return [
                'id' => $existing->id,
                'status' => 'conflict',
                'message' => 'Evaluation response already exists',
            ];
        }

        // Validate required fields
        $validator = Validator::make($data, [
            'evaluation_id' => 'required|exists:evaluations,id',
            'responses' => 'required|array',
        ]);

        if ($validator->fails()) {
            throw new \Exception('Validation failed: ' . json_encode($validator->errors()));
        }

        // Create new evaluation response
        $response = EvaluationResponse::create([
            'evaluation_id' => $data['evaluation_id'],
            'evaluator_id' => auth()->id(),
            'evaluates_id' => $data['evaluates_id'] ?? null,
            'status' => 'pending',
            'created_at' => date('Y-m-d H:i:s', $timestamp / 1000),
        ]);

        // Store question responses
        if (isset($data['responses']) && is_array($data['responses'])) {
            foreach ($data['responses'] as $questionResponse) {
                $response->questionResponses()->create([
                    'question_id' => $questionResponse['question_id'],
                    'response' => $questionResponse['response'],
                ]);
            }
        }

        return [
            'id' => $response->id,
            'status' => 'created',
        ];
    }

    /**
     * Update evaluation response from offline data
     */
    private function updateEvaluationResponse(array $data, int $timestamp): array
    {
        $response = EvaluationResponse::find($data['id']);

        if (!$response) {
            throw new \Exception('Evaluation response not found');
        }

        // Conflict resolution
        $serverTimestamp = strtotime($response->updated_at) * 1000;
        if ($serverTimestamp > $timestamp) {
            return [
                'id' => $response->id,
                'status' => 'conflict',
                'message' => 'Server version is newer',
            ];
        }

        // Update responses
        if (isset($data['responses']) && is_array($data['responses'])) {
            $response->questionResponses()->delete();
            foreach ($data['responses'] as $questionResponse) {
                $response->questionResponses()->create([
                    'question_id' => $questionResponse['question_id'],
                    'response' => $questionResponse['response'],
                ]);
            }
        }

        $response->update([
            'updated_at' => date('Y-m-d H:i:s', $timestamp / 1000),
        ]);

        return [
            'id' => $response->id,
            'status' => 'updated',
        ];
    }

    /**
     * Get pending sync count for current user
     */
    public function getPendingCount(Request $request): JsonResponse
    {
        // This endpoint can be used by the client to check if there are any conflicts
        // or items that need attention after sync
        return response()->json([
            'pending_count' => 0, // Client manages this locally
            'server_time' => time() * 1000,
        ]);
    }
}
