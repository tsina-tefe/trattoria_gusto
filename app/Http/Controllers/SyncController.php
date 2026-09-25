<?php

namespace App\Http\Controllers;

use App\Models\InventoryCount;
use App\Models\EvaluationResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class SyncController extends Controller
{
    /**
     * Sync inventory counts from offline storage
     */
    public function syncInventoryCount(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:create,update,delete',
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
                'create' => $this->createInventoryCount($data, $timestamp),
                'update' => $this->updateInventoryCount($data, $timestamp),
                'delete' => $this->deleteInventoryCount($data, $timestamp),
            };

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Sync inventory count failed', [
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
     * Create inventory count from offline data
     */
    private function createInventoryCount(array $data, int $timestamp): array
    {
        // Check if already exists (conflict resolution)
        $existing = InventoryCount::where('inventory_period_id', $data['inventory_period_id'])
            ->where('product_id', $data['product_id'])
            ->where('branch_id', $data['branch_id'])
            ->first();

        if ($existing) {
            // Item already synced, return conflict status
            return [
                'id' => $existing->id,
                'status' => 'conflict',
                'message' => 'Count already exists',
                'existing' => $existing,
            ];
        }

        // Validate required fields
        $validator = Validator::make($data, [
            'inventory_period_id' => 'required|exists:inventory_periods,id',
            'product_id' => 'required|exists:products,id',
            'branch_id' => 'required|exists:branches,id',
            'child_category_id' => 'required|exists:child_categories,id',
            'count' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            throw new \Exception('Validation failed: ' . json_encode($validator->errors()));
        }

        // Create new count
        $count = InventoryCount::create([
            'inventory_period_id' => $data['inventory_period_id'],
            'product_id' => $data['product_id'],
            'branch_id' => $data['branch_id'],
            'child_category_id' => $data['child_category_id'],
            'count' => $data['count'],
            'unit_price' => $data['unit_price'] ?? null,
            'total_price' => $data['total_price'] ?? null,
            'is_approved' => false,
            'created_by' => auth()->id(),
            'created_at' => date('Y-m-d H:i:s', $timestamp / 1000),
        ]);

        return [
            'id' => $count->id,
            'status' => 'created',
        ];
    }

    /**
     * Update inventory count from offline data
     */
    private function updateInventoryCount(array $data, int $timestamp): array
    {
        // Find by server ID or unique combination
        $count = null;

        if (isset($data['id'])) {
            $count = InventoryCount::find($data['id']);
        }

        if (!$count && isset($data['inventory_period_id'], $data['product_id'], $data['branch_id'])) {
            $count = InventoryCount::where('inventory_period_id', $data['inventory_period_id'])
                ->where('product_id', $data['product_id'])
                ->where('branch_id', $data['branch_id'])
                ->first();
        }

        if (!$count) {
            throw new \Exception('Inventory count not found');
        }

        // Conflict resolution: check if server version is newer
        $serverTimestamp = strtotime($count->updated_at) * 1000;
        if ($serverTimestamp > $timestamp) {
            return [
                'id' => $count->id,
                'status' => 'conflict',
                'message' => 'Server version is newer',
                'serverData' => $count,
            ];
        }

        // Update count
        $count->update([
            'count' => $data['count'],
            'unit_price' => $data['unit_price'] ?? $count->unit_price,
            'total_price' => $data['total_price'] ?? $count->total_price,
            'updated_by' => auth()->id(),
            'updated_at' => date('Y-m-d H:i:s', $timestamp / 1000),
        ]);

        return [
            'id' => $count->id,
            'status' => 'updated',
        ];
    }

    /**
     * Delete inventory count from offline data
     */
    private function deleteInventoryCount(array $data, int $timestamp): array
    {
        $count = InventoryCount::find($data['id']);

        if (!$count) {
            return [
                'id' => $data['id'],
                'status' => 'not_found',
                'message' => 'Count already deleted or not found',
            ];
        }

        $count->delete();

        return [
            'id' => $data['id'],
            'status' => 'deleted',
        ];
    }

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
