import asyncio
from typing import List, Dict, Any
from app.services.storage import get_storage
from app.core.config import settings
import logging

logger = logging.getLogger("omnipulse.buffer")

class AsyncEventBuffer:
    def __init__(self, batch_size: int = settings.BUFFER_BATCH_SIZE, flush_interval: float = settings.BUFFER_FLUSH_INTERVAL_SECONDS):
        self.queue: asyncio.Queue = asyncio.Queue()
        self.batch_size = batch_size
        self.flush_interval = flush_interval
        self._worker_task: asyncio.Task | None = None
        self._running = False

    async def start(self):
        """Starts background flush worker."""
        self._running = True
        self._worker_task = asyncio.create_task(self._flush_loop())
        logger.info("Event ingestion buffer worker started")

    async def stop(self):
        """Stops background flush worker and drains remaining events."""
        self._running = False
        if self._worker_task:
            self._worker_task.cancel()
        await self._flush_remaining()
        logger.info("Event ingestion buffer worker stopped")

    async def push_event(self, event_data: Dict[str, Any]):
        """Pushes single event payload into queue in sub-millisecond."""
        await self.queue.put(event_data)

    async def push_batch(self, events: List[Dict[str, Any]]):
        """Pushes batch of events into queue."""
        for e in events:
            await self.queue.put(e)

    async def _flush_loop(self):
        while self._running:
            try:
                batch: List[Dict[str, Any]] = []
                # Collect items up to batch_size or wait flush_interval
                start_time = asyncio.get_event_loop().time()
                while len(batch) < self.batch_size:
                    timeout = max(0.01, self.flush_interval - (asyncio.get_event_loop().time() - start_time))
                    try:
                        item = await asyncio.wait_for(self.queue.get(), timeout=timeout)
                        batch.append(item)
                        self.queue.task_done()
                    except asyncio.TimeoutError:
                        break

                if batch:
                    storage = get_storage()
                    storage.insert_events(batch)
                    logger.debug(f"Flushed {len(batch)} events to analytical storage")

                await asyncio.sleep(0.05)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error flushing event buffer: {e}", exc_info=True)
                await asyncio.sleep(0.5)

    async def _flush_remaining(self):
        batch: List[Dict[str, Any]] = []
        while not self.queue.empty():
            try:
                batch.append(self.queue.get_nowait())
                self.queue.task_done()
            except Exception:
                break
        if batch:
            get_storage().insert_events(batch)
            logger.info(f"Drained and flushed {len(batch)} remaining events")

event_buffer = AsyncEventBuffer()
